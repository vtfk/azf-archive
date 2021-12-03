const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const { E18: { URL, KEY } } = require('../config')

module.exports = async (jobId, taskId, result) => {
  if (!jobId || !taskId) return

  try {
    const payload = {
      status: result.status,
      message: result.message || ''
    }
    if (result.status === 'failed') {
      payload.error = result.error
    } else {
      payload.data = result.data
    }

    const headers = {
      headers: {
        'X-API-KEY': KEY
      }
    }

    const { data } = await axios.post(`${URL}/jobs/${jobId}/tasks/${taskId}/operations`, payload, headers)
    logger('info', ['set-e18-stats', result.status, 'successfull', data])
  } catch (error) {
    logger('error', ['set-e18-stats', result.status, 'failed', error])
  }
}
