const { logger } = require('@vtfk/logger')
const getService = require('./get-service')
const getQuery = require('./get-query')
const getOptions = require('./get-options')
const repackResult = require('./repack-result')
const HTTPError = require('./http-error')

const getParameterCount = query => query && query.parameter ? Object.getOwnPropertyNames(query.parameter).length : 0

module.exports = async options => {
  const { service, method, secure, parameter, extras, caseNumbers } = options
  const clientService = getService(service, secure)
  const query = getQuery(parameter)
  const data = await clientService[method](query)
  const opts = getOptions(extras, method)
  const repacked = repackResult(data, opts)
  if (repacked.ErrorMessage) {
    logger('error', ['call-archive', service, method, 'parameters', getParameterCount(query), repacked.ErrorMessage])
    throw new HTTPError(500, repacked)
  }
  repacked.caseNumbers = caseNumbers || []
  logger('info', ['call-archive', service, method, 'parameters', getParameterCount(query), 'results', Array.isArray(repacked) ? repacked.length : typeof repacked === 'object' ? 1 : 0, 'options', opts])
  return repacked
}
