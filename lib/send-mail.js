const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const { MAIL: { bcc, cc, from, signature, url, secret } } = require('../config')

module.exports = async options => {
  const { to, subject, body } = options
  const payload = {
    to,
    from,
    subject,
    template: {
      templateName: 'vtfk',
      templateData: {
        body,
        signature
      }
    }
  }
  if (cc) payload.cc = cc // don't add them to payload if not necessary (mail-api throws error when empty list)
  if (bcc) payload.bcc = bcc

  try {
    const { data } = await axios.post(`${url}?subscription-key=${secret}`, payload)
    logger('info', ['send-mail', 'mail sent', 'to', payload.to, 'cc', cc, 'bcc', bcc])
    return data
  } catch (error) {
    logger('error', ['send-mail', 'failed to send mail', 'to', payload.to, 'cc', cc, 'bcc', bcc, error])
    return null
  }
}
