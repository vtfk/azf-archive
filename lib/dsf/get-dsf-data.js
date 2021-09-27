const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const generateSystemJwt = require('../generate-system-jwt')
const HTTPError = require('../http-error')
const { DSF } = require('../../config')

module.exports = async fnr => {
  const payload = {
    method: 'hentDetaljer',
    massLookup: true,
    query: {
      saksref: DSF.saksref,
      foedselsnr: fnr
    }
  }

  try {
    const { data } = await axios.post(DSF.url, payload, { headers: { Authorization: generateSystemJwt(DSF.jwt_secret) } })
    return data
  } catch (error) {
    const { status, data } = error.response
    logger('error', ['get-dsf-data', status, data])
    throw new HTTPError(status, data)
  }
}
