const { logConfig, logger } = require('@vtfk/logger')
const callArchive = require('../lib/call-archive')
const getResponseObject = require('../lib/get-response-object')
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
    const repacked = await callArchive({
      service,
      method,
      secure,
      parameter,
      extras: options
    })
    return getResponseObject(repacked)
  } catch (error) {
    logger('error', [error])
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(400, error.message).toJSON()
  }
}
