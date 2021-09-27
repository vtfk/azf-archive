const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const generateSystemJwt = require('../generate-system-jwt')
const HTTPError = require('../http-error')
const { dsf } = require('../../config')

module.exports = async fnr => {
  const payload = {
    method: 'hentDetaljer',
    massLookup: true,
    query: {
      saksref: dsf.saksref,
      foedselsnr: fnr
    }
  }

  try {
    const { data } = await axios.post(dsf.url, payload, { headers: { Authorization: generateSystemJwt(dsf.jwt_secret) } })
    return data
  } catch (error) {
    const { status, data } = error.response
    logger('error', ['get-dsf-data', status, data])
    throw new HTTPError(status, data)
  }
}
