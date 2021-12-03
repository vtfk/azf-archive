const { logConfig, logger } = require('@vtfk/logger')
const getDsfData = require('../lib/dsf/get-dsf-data')
const repackDsfObject = require('../lib/dsf/repackDsfObject')
const getResponseObject = require('../lib/get-response-object')
const syncPrivatePerson = require('../lib/archive/syncPrivatePerson')
const HTTPError = require('../lib/http-error')
const setE18Stats = require('../lib/set-e18-stats')

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
    await setE18Stats(undefined, undefined, { status: 'failed', error: 'Please pass a request body' })
    return new HTTPError(400, 'Please pass a request body').toJSON()
  }

  let result = {}

  const { ssn, oldSsn, birthdate, firstName, lastName, jobId, taskId } = req.body
  try {
    if (!ssn && !(birthdate && firstName && lastName)) {
      throw new HTTPError(400, 'Missing required parameter "ssn" or "birthdate, firstname, lastname"')
    }
    if (oldSsn && oldSsn.length !== 11) {
      throw new HTTPError(400, 'Parameter "oldSsn" must be of length 11')
    }
    if (oldSsn && !ssn) {
      throw new HTTPError(400, 'Parameter "oldSsn" must be in combination with "ssn')
    }

    const dsfSearchParameter = ssn ? oldSsn ? { ssn, oldSsn } : { ssn } : { birthdate, firstName, lastName }

    const dsfData = await getDsfData(dsfSearchParameter)
    result.dsfPerson = repackDsfObject(dsfData.RESULT.HOV)
    result.privatePerson = await syncPrivatePerson(result.dsfPerson)

    result = { msg: 'Succesfully synced elevmappe', ...result }
    await setE18Stats(jobId, taskId, { status: 'completed', data: result })
    return getResponseObject(result)
  } catch (error) {
    if (error.response && error.response.data) {
      const { data } = error.response
      await setE18Stats(jobId, taskId, { status: 'failed', error: data, message: data.message })
    } else {
      await setE18Stats(jobId, taskId, { status: 'failed', error, message: error.message })
    }

    if (error instanceof HTTPError) {
      logger('error', [error.message])
      return error.toJSON()
    }
    logger('error', [error])
    return getResponseObject(error, 500)
  }
}
