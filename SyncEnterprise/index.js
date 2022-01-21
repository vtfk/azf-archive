const { logConfig, logger } = require('@vtfk/logger')
const { create: roadRunner } = require('@vtfk/e18')
const getBrregData = require('../lib/get-brreg-data')
const repackBrregObject = require('../lib/repack-brreg-result')
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

  const { orgnr, e18 } = req.body
  try {
    if (!orgnr) throw new HTTPError(400, 'Missing required parameter "orgnr"')

    const brregData = await getBrregData(orgnr)
    result.repackedBrreg = repackBrregObject(brregData)
    result.enterprise = await syncEnterprise(result.repackedBrreg)

    result = { msg: 'Succesfully synced Enterprise', result }
    await roadRunner(e18, { status: 'completed', data: result }, context)
    return getResponseObject(result)
  } catch (error) {
    const data = error.response?.data || error instanceof HTTPError ? error.toJSON() : error
    await roadRunner(e18, { status: 'failed', error: data }, context)

    if (error instanceof HTTPError) {
      logger('error', [error.message])
      return error.toJSON()
    }

    logger('error', [error])
    if (typeof error === 'object') {
      error.error = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    }
    return getResponseObject(error, 200)
  }
}
