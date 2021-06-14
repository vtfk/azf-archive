const { logConfig, logger } = require('@vtfk/logger')
const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const repackResult = require('../lib/repack-result')
const HTTPError = require('../lib/http-error')

module.exports = async (context, req) => {
  if (!req.body) {
    logger('error', ['Please pass a request body'])
    return new HTTPError(400, 'Please pass a request body').toJSON()
  }

  const { service, method, secure, options, parameter } = req.body
  if (!service) {
    logger('error', ['Missing required parameter \'service\''])
    return new HTTPError(400, 'Missing required parameter \'service\'').toJSON()
  }
  if (!method) {
    logger('error', ['Missing required parameter \'method\''])
    return new HTTPError(400, 'Missing required parameter \'method\'').toJSON()
  }
  if (!parameter) {
    logger('error', ['Missing required parameter \'parameter\''])
    return new HTTPError(400, 'Missing required parameter \'parameter\'').toJSON()
  }

  logConfig({
    prefix: `${context.invocationId} - ${service} - ${method}${secure ? ' - secure' : ''}`,
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  try {
    const clientService = getService(service, secure)
    const query = getQuery(parameter)
    logger('info', ['parameters', query && query.parameter ? Object.getOwnPropertyNames(query.parameter).length : 0])
    const data = await clientService[method](query)
    const repacked = repackResult(data, options)
    logger('info', [Array.isArray(repacked) ? `${repacked.length} results` : typeof repacked === 'object' ? '1 result' : '0 results', 'options', options])
    return {
      body: repacked
    }
  } catch (error) {
    logger('error', [error])
    return new HTTPError(400, error.message).toJSON()
  }
}
