const { logConfig, logger } = require('@vtfk/logger')
const validate = require('./validate-jwt')
const { PAPERTRAIL, JWT_SECRET } = require('../../config')
const HTTPError = require('../http-error')

module.exports = async (context, request, next) => {
  logConfig({
    remote: {
      disabled: PAPERTRAIL.DISABLE_LOGGING
    }
  })

  const bearerToken = request.headers.authorization
  if (!bearerToken) {
    logger('warn', ['with-token-auth', request.url, 'no-authorization-header'])
    return new HTTPError(400, 'Authorization header is missing').toJSON()
  }

  try {
    const token = bearerToken.replace('Bearer ', '')
    await validate({ jwt: token, tokenKey: JWT_SECRET })
    logConfig({
      prefix: `${context.invocationId}`,
      azure: {
        context,
        excludeInvocationId: true
      }
    })
    return next(context, request)
  } catch (error) {
    logConfig({
      prefix: `${context.invocationId}`,
      azure: {
        context,
        excludeInvocationId: true
      }
    })
    logger('error', ['with-token-auth', request.url, 'invalid-token', error && error.message ? typeof error.message === 'object' ? JSON.stringify(error.message, null, 2) : error.message : ''])
    return new HTTPError(401, 'Authorization token is invalid').toJSON()
  }
}
