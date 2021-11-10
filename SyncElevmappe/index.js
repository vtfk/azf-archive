const { logConfig, logger } = require('@vtfk/logger')
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

  const result = {}

  if (!req.body) {
    logger('error', ['Please pass a request body'])
    return new HTTPError(400, 'Please pass a request body').toJSON()
  }

  const { ssn, oldSsn, birthdate, firstName, lastName, newSchools } = req.body
  if (!ssn && !(birthdate && firstName && lastName)) {
    logger('error', ['Missing required parameter "ssn" or "birthdate, firstname, lastname"'])
    return new HTTPError(400, 'Missing required parameter "ssn" or "birthdate, firstname, lastname"').toJSON()
  }
  if (newSchools && !Array.isArray(newSchools)) {
    return new HTTPError(400, 'Parameter "newSchools" must be array').toJSON()
  }
  if (oldSsn && oldSsn.length !== 11) {
    return new HTTPError(400, 'Parameter "oldSsn" must be of length 11').toJSON()
  }
  if (oldSsn && !ssn) {
    return new HTTPError(400, 'Parameter "oldSsn" must be in combination with "ssn').toJSON()
  }

  let dsfSearchParameter = {}
  if (ssn) {
    dsfSearchParameter = oldSsn ? { ssn, oldSsn } : { ssn }
  } else {
    dsfSearchParameter = { birthdate, firstName, lastName }
  }

  try {
    const dsfData = await getDsfData(dsfSearchParameter)
    result.dsfPerson = repackDsfObject(dsfData.RESULT.HOV)
    result.privatePerson = await syncPrivatePerson(result.dsfPerson)
    result.elevmappe = await syncElevmappe(result.privatePerson)
    if (newSchools) {
      result.readPermissions = await syncReadPermissions(result.elevmappe.CaseNumber, req.body.newSchools)
    }

    return getResponseObject({ msg: 'Succesfully synced elevmappe', ...result })
  } catch (error) {
    logger('error', [error])
    if (error instanceof HTTPError) return error.toJSON()
    return getResponseObject(error, 500)
  }
}
