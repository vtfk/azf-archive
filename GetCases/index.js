const { logConfig, logger } = require('@vtfk/logger')
const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const repackResult = require('../lib/repack-result')
const HTTPError = require('../lib/http-error')

module.exports = async (context, req) => {
  logConfig({
    prefix: `${context.invocationId}`,
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  if (!req.body) {
    logger('error', ['Please pass a request body'])
    return new HTTPError(400, 'Please pass a request body').toJSON()
  }

  const { secure, options, parameter } = req.body
  if (!parameter) {
    logger('error', ['Missing required parameter \'parameter\''])
    return new HTTPError(400, 'Missing required parameter \'parameter\'').toJSON()
  }

  try {
    const clientService = getService('CaseService', secure)
    const query = getQuery(parameter)
    const data = await clientService.GetCases(query)
    const repacked = repackResult(data, { ...options, firstOne: true })
    return {
      body: repacked
    }
  } catch (error) {
    logger('error', [error])
    return new HTTPError(400, error.message).toJSON()
  }
}
