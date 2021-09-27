const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const HTTPError = require('../http-error')
const { PDF_GENERATOR: { url } } = require('../../config')

module.exports = async options => {
  const { pdf: payload } = require(`./templates/${options.system}-${options.template}.json`)
  if (options.language) {
    payload.language = options.language
  }
  if (options.student) {
    if (options.student.name) {
      payload.data.student.name = options.student.name
    }
    if (options.student.classId) {
      payload.data.student.classId = options.student.classId
    }
  }
  if (options.teacher && options.teacher.name) {
    payload.data.teacher.name = options.teacher.name
  }
  if (options.school && options.school.name) {
    payload.data.school.name = options.school.name
  }

  payload.data.created.timestamp = new Date().getTime()

  try {
    const { data } = await axios.post(url, payload)
    return data.data.base64
  } catch (error) {
    const { status, data } = error.response
    logger('error', ['generate-pdf', status, data])
    throw new HTTPError(status, data)
  }
}
