const { logConfig, logger } = require('@vtfk/logger')
const { create: roadRunner } = require('@vtfk/e18')
const getDsfData = require('../lib/dsf/get-dsf-data')
const repackDsfObject = require('../lib/dsf/repackDsfObject')
const getResponseObject = require('../lib/get-response-object')
const syncPrivatePerson = require('../lib/archive/syncPrivatePerson')
const HTTPError = require('../lib/http-error')
const { graphRequest } = require('../lib/graph-requests')
const syncEmployee = require('../lib/archive/syncEmployee')

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
  if (req.body.requireAccessGroups === undefined) {
    req.body.requireAccessGroups = true
  }

  const { ssn, oldSsn, birthdate, firstName, lastName, upn, streetAddress, zipCode, zipPlace, addressCode, skipDSF, requireAccessGroups } = req.body

  try {
    if (!(ssn && upn) && !(upn && birthdate && firstName && lastName)) {
      throw new HTTPError(400, 'Missing required parameter "ssn, upn" or "upn, birthdate, firstname, lastname"')
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

    // Get closest manager from azure ad (create app reg)
    const managerUrl = `https://graph.microsoft.com/v1.0/users/${upn}/manager?$select=displayName,companyName,department,onPremisesUserPrincipalName,onPremisesSamAccountName`
    const manager = await graphRequest(managerUrl)
    result.manager = manager

    const syncEmployeeRes = await syncEmployee(result.privatePerson, result.manager, requireAccessGroups)
    result = syncEmployeeRes

    // Get manager from P360

    // Get unitstuff from P360
    // Get access groups from god knows

    // Check if project exists
    // Create if it dont
    // Check metadata if it does
    // Alert archive if it is multiple projects
    // Expand result with: unitnumber, accessgroups (names/codes), projectnumber
    // PROFIT!

    await roadRunner(req, { status: 'completed', data: result }, context)
    return getResponseObject(result)
  } catch (error) {
    if (typeof error === 'object') {
      delete error.config
    }
    const data = error.response?.data || error instanceof HTTPError ? error.toJSON() : error
    const status = (error.response && error.response.status) || error.statusCode || 500
    await roadRunner(req, { status: 'failed', error: data }, context)

    if (error instanceof HTTPError) {
      logger('error', [status, error.innerError || error.message])
      return error.toJSON()
    }
    logger('error', [status, error])
    if (typeof error === 'object') {
      error.error = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    }
    return getResponseObject(error, status)
  }
}
