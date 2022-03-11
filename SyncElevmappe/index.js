const { logConfig, logger } = require('@vtfk/logger')
const { create: roadRunner } = require('@vtfk/e18')
const getDsfData = require('../lib/dsf/get-dsf-data')
const repackDsfObject = require('../lib/dsf/repackDsfObject')
const getResponseObject = require('../lib/get-response-object')
const syncPrivatePerson = require('../lib/archive/syncPrivatePerson')
const syncElevmappe = require('../lib/archive/syncElevmappe')
const HTTPError = require('../lib/http-error')
const syncReadPermissions = require('../lib/archive/syncReadPermissions')

module.exports = async function (context, req) {
  logConfig({
    prefix: `${context.invocationId} - ${context.bindingData.sys.methodName}`,
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  if (!req.body) {
    logger('error', ['Please pass a request body'])
    return new HTTPError(400, 'Please pass a request body').toJSON()
  }

  let result = {}

  const { ssn, oldSsn, birthdate, firstName, lastName, newSchools, streetAddress, zipCode, zipPlace, addressCode, skipDSF } = req.body
  try {
    if (!ssn && !(birthdate && firstName && lastName)) {
      throw new HTTPError(400, 'Missing required parameter "ssn" or "birthdate, firstname, lastname"')
    }
    if (newSchools && !Array.isArray(newSchools)) {
      throw new HTTPError(400, 'Parameter "newSchools" must be array')
    }
    if (oldSsn && oldSsn.length !== 11) {
      throw new HTTPError(400, 'Parameter "oldSsn" must be of length 11')
    }
    if (oldSsn && !ssn) {
      throw new HTTPError(400, 'Parameter "oldSsn" must be in combination with "ssn"')
    }

    if (!skipDSF) {
      const dsfSearchParameter = ssn ? oldSsn ? { ssn, oldSsn } : { ssn } : { birthdate, firstName, lastName }
      const dsfData = await getDsfData(dsfSearchParameter)
      result.dsfPerson = repackDsfObject(dsfData.RESULT.HOV)
      result.privatePerson = await syncPrivatePerson(result.dsfPerson)
    } else {
      if (!ssn || !firstName || !lastName || !streetAddress || !zipCode || !zipPlace || (!addressCode && addressCode !== 0)) {
        throw new HTTPError(400, 'When using "skipDSF", you must provide parameters "ssn", "firstname", "lastname", "streetAddress", "zipCode", "zipPlace" and "addressCode"')
      }
      const withoutDSF = {
        ssn,
        oldSsn: oldSsn || ssn,
        firstName,
        lastName,
        streetAddress,
        zipCode,
        zipPlace,
        addressCode
      }
      result.privatePerson = await syncPrivatePerson(withoutDSF)
      logger('warn', ['Elevmappe and privateperson was created without DSF (flag "skipDSF=true")'])
    }

    result.elevmappe = await syncElevmappe(result.privatePerson)
    if (newSchools) {
      result.readPermissions = await syncReadPermissions(result.elevmappe.CaseNumber, req.body.newSchools)
    }

    result = { msg: 'Succesfully synced elevmappe', ...result }
    await roadRunner(req, { status: 'completed', data: result }, context)
    return getResponseObject(result)
  } catch (error) {
    const data = error.response?.data || error instanceof HTTPError ? error.toJSON() : error
    await roadRunner(req, { status: 'failed', error: data }, context)

    if (error instanceof HTTPError) {
      logger('error', [error.message])
      return error.toJSON()
    }
    logger('error', [error])
    if (typeof error === 'object') {
      error.error = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    }
    return getResponseObject(error, 500)
  }
}
