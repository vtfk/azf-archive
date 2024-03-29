const { logger } = require('@vtfk/logger')
const getService = require('./get-service')
const getQuery = require('./get-query')
const getOptions = require('./get-options')
const repackResult = require('./repack-result')
const HTTPError = require('./http-error')

const getParameterCount = query => query && query.parameter ? Object.getOwnPropertyNames(query.parameter).length : 0

module.exports = async options => {
  const { service, method, secure, parameter, extras } = options
  if (secure && method !== 'CreateDocument') throw new HTTPError(403, 'option "secure" is only allowed with method "CreateDocument".')
  const clientService = getService(service, secure)
  const query = getQuery(parameter)
  const data = await clientService[method](query)
  const opts = getOptions(extras, method)
  if (method.toLowerCase() === 'ping') {
    logger('info', ['call-archive', service, method, 'parameters', getParameterCount(query), 'results', 'PING', 'options', opts])
    return data
  }
  const repacked = repackResult(data, opts)
  if (repacked.error) {
    logger('error', ['call-archive', service, method, 'parameters', getParameterCount(query), repacked.error])
    throw new HTTPError(500, repacked)
  }
  logger('info', ['call-archive', service, method, 'parameters', getParameterCount(query), 'results', Array.isArray(repacked) ? repacked.length : typeof repacked === 'object' ? 1 : 0, 'options', opts])
  return repacked
}
