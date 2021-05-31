const getP360Client = require('@alheimsins/p360')
const { P360 } = require('../config')

/**
 * Returns a SOAP service client
 *
 * Service can be one of: <pre>
 *  - CaseService
 *  - ContactService
 *  - DocumentService
 *  - FileService
 *  - UserService
 * </pre>
 * @param {String} service What service to get
 * @returns strong-soap Client
 */
module.exports = async service => {
  const client = getP360Client(P360)
  return await client[service]()
}
