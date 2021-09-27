const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const generateSystemJwt = require('../generate-system-jwt')
const HTTPError = require('../http-error')
const { DSF: { saksref, url, jwtSecret } } = require('../../config')

module.exports = async ssn => {
  const payload = {
    method: 'hentDetaljer',
    massLookup: true,
    query: {
      saksref,
      foedselsnr: ssn
    }
  }

  try {
    const { data } = await axios.post(url, payload, { headers: { Authorization: generateSystemJwt(jwtSecret) } })
    return data
  } catch (error) {
    const { status, data } = error.response
    logger('error', ['get-dsf-data', status, data])
    throw new HTTPError(status, data)
  }
}
