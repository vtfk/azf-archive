const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const generateSystemJwt = require('../generate-system-jwt')
const HTTPError = require('../http-error')
const { DSF: { saksref, url, jwtSecret } } = require('../../config')

module.exports = async dsfSearchParameter => {
  let payload
  if (dsfSearchParameter.ssn) {
    payload = {
      method: 'hentDetaljer',
      massLookup: true,
      query: {
        saksref,
        foedselsnr: dsfSearchParameter.ssn
      }
    }
  } else {
    payload = {
      method: 'hentDetaljer',
      massLookup: true,
      query: {
        saksref,
        foedselsdato: dsfSearchParameter.birthdate,
        etternavn: dsfSearchParameter.lastName,
        fornavn: dsfSearchParameter.firstName
      }
    }
  }

  try {
    const { data } = await axios.post(url, payload, { headers: { Authorization: generateSystemJwt(jwtSecret) } })
    if (data.RESULT.ANTA === '0000') throw new HTTPError(404, 'Could not find any persons with given identification')
    if (data.RESULT.ANTA) throw new HTTPError(404, 'Found several persons with given identification, cannot automate')
    return data
  } catch (error) {
    const status = error.response ? error.response.status : error.statusCode
    const data = error.response ? error.response.data : error.message
    logger('error', ['get-dsf-data', status, data])
    throw new HTTPError(status, data)
  }
}
