const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const HTTPError = require('./http-error')
const createMetadata = require('./create-metadata')
const { PDF_GENERATOR: { url } } = require('../config')

module.exports = async options => {
  const { pdf: template } = require(`../templates/${options.system}-${options.template}.json`)
  const payload = createMetadata({ template, documentData: options })
  if (payload.data.created.timestamp) {
    payload.data.created.timestamp = new Date().getTime()
  }

  try {
    const { data } = await axios.post(url, payload)
    return data.data.base64
  } catch (error) {
    const { status, data } = error.response
    logger('error', ['generate-pdf', status, data])
    throw new HTTPError(status, data)
  }
}
