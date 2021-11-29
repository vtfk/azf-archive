const { logConfig, logger } = require('@vtfk/logger')
const getDsfData = require('../lib/dsf/get-dsf-data')
const repackDsfObject = require('../lib/dsf/repackDsfObject')
const getResponseObject = require('../lib/get-response-object')
const syncPrivatePerson = require('../lib/archive/syncPrivatePerson')
const HTTPError = require('../lib/http-error')

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

  const { ssn, oldSsn, birthdate, firstName, lastName } = req.body
  if (!ssn && !(birthdate && firstName && lastName)) {
    logger('error', ['Missing required parameter "ssn" or "birthdate, firstname, lastname"'])
    return new HTTPError(400, 'Missing required parameter "ssn" or "birthdate, firstname, lastname"').toJSON()
  }
  if (oldSsn && oldSsn.length !== 11) {
    return new HTTPError(400, 'Parameter "oldSsn" must be of length 11').toJSON()
  }
  if (oldSsn && !ssn) {
    return new HTTPError(400, 'Parameter "oldSsn" must be in combination with "ssn').toJSON()
  }

  const dsfSearchParameter = ssn ? oldSsn ? { ssn, oldSsn } : { ssn } : { birthdate, firstName, lastName }

  try {
    const dsfData = await getDsfData(dsfSearchParameter)
    result.dsfPerson = repackDsfObject(dsfData.RESULT.HOV)
    result.privatePerson = await syncPrivatePerson(result.dsfPerson)

    return getResponseObject({ msg: 'Succesfully synced elevmappe', ...result })
  } catch (error) {
    logger('error', [error])
    if (error instanceof HTTPError) return error.toJSON()
    return getResponseObject(error, 500)
  }
}
