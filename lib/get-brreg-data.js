const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const HTTPError = require('./http-error')
const { BRREG: { url, branchUrl } } = require('../config')

module.exports = async orgnr => {
  // Attempt to get a company from brreg, if not found, attempt to get the branch
  try {
    const { data } = await axios.get(`${url}${orgnr}`)
    return data
  } catch (error) {
    try {
      const branch = await axios.get(`${branchUrl}${orgnr}`)
      return branch.data
    } catch (err) {
      const status = err.response ? err.response.status : err.statusCode
      const data = err.response ? err.response.data : err.message
      logger('error', ['get-brreg-data', status, data])
      throw new HTTPError(status, data)
    }
  }
}
