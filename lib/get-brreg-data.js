const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const HTTPError = require('./http-error')
const { BRREG: { url } } = require('../config')

module.exports = async orgnr => {
  try {
    const { data } = await axios.get(`${url}${orgnr}`)
    return data
  } catch (error) {
    const status = error.response ? error.response.status : error.statusCode
    const data = error.response ? error.response.data : error.message
    logger('error', ['get-brreg-data', status, data])
    throw new HTTPError(status, data)
  }
}
