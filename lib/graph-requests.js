const getGraphToken = require('./get-graph-token')
const axios = require('axios')
const { logger } = require('@vtfk/logger')

const graphRequest = async (url) => {
  const token = await getGraphToken()
  logger('info', ['graphRequest', url.slice(0, url.indexOf('?'))])
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, Accept: 'application/json;odata.metadata=minimal;odata.streaming=true', 'accept-encoding': null })
  logger('info', ['graphRequest', 'got data'])
  return data
}

module.exports = { graphRequest }
