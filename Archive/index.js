const { logger } = require('@vtfk/logger')
const withTokenAuth = require('../lib/auth/with-token-auth')
const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const repackResult = require('../lib/repack-result')
const HTTPError = require('../lib/http-error')

const callService = async (context, req) => {
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

  try {
    const clientService = getService(service, secure)
    const query = getQuery(parameter)
    const data = await clientService[method](query)
    const repacked = repackResult(data, options)
    return {
      body: repacked
    }
  } catch (error) {
    logger('error', [error])
    return new HTTPError(400, error.message).toJSON()
  }
}

module.exports = async (context, req) => withTokenAuth(context, req, callService)
