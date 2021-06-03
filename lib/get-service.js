const getP360Client = require('@vtfk/p360')
const { logger } = require('@vtfk/logger')
const { P360, P360_SECURE } = require('../config')

/**
 * Returns a RPC service client
 *
 * Service can be one of: <pre>
 *  - AccessGroupService
 *  - CaseService
 *  - ContactService
 *  - DocumentService
 *  - EstateService
 *  - FileService
 *  - MyCasesService
 *  - ProjectService
 *  - UserService
 * </pre>
 * @param {String} service What service to get
 * @param {Boolean} secure If true, connect to SECURE P360; If false or undefined, connect to REGULAR P360
 * @returns SIF Service
 */
module.exports = (service, secure) => {
  logger('info', `Connecting to ${secure ? `P360 secure (${P360_SECURE.host})` : `P360 regular (${P360.host})`}`)
  const client = getP360Client(secure ? P360_SECURE : P360)
  client[service].url = secure ? P360_SECURE.host : P360.host
  return client[service]
}
