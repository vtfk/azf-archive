const { logger } = require('@vtfk/logger')
const getService = require('./get-service')
const getQuery = require('./get-query')
const getOptions = require('./get-options')
const repackResult = require('./repack-result')
const HTTPError = require('./http-error')

module.exports = async options => {
  const clientService = getService(options.service, options.secure)
  const query = getQuery(options.parameter)
  logger('info', ['parameters', query && query.parameter ? Object.getOwnPropertyNames(query.parameter).length : 0])
  const data = await clientService[options.method](query)
  const opts = getOptions(options.extras, options.method)
  const repacked = repackResult(data, opts)
  if (repacked.ErrorMessage) {
    logger('error', ['call-archive', repacked.ErrorMessage])
    throw new HTTPError(500, repacked)
  }
  logger('info', [Array.isArray(repacked) ? `${repacked.length} results` : typeof repacked === 'object' ? '1 result' : '0 results', 'options', opts])
  return repacked
}
