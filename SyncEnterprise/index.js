const { logConfig, logger } = require('@vtfk/logger')
const { create: roadRunner } = require('@vtfk/e18')
const getBrregData = require('../lib/get-brreg-data')
const { repackBrreg } = require('../lib/repack-brreg-result')
const syncEnterprise = require('../lib/archive/syncEnterprise')
const getResponseObject = require('../lib/get-response-object')
const HTTPError = require('../lib/http-error')

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

  const { orgnr } = req.body
  try {
    if (!orgnr) throw new HTTPError(400, 'Missing required parameter "orgnr"')

    const brregData = await getBrregData(orgnr)
    result.repackedBrreg = repackBrreg(brregData)
    result.enterprise = await syncEnterprise(result.repackedBrreg)

    result = { msg: 'Succesfully synced Enterprise', result }
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
