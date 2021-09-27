const { logConfig, logger } = require('@vtfk/logger')
const callArchive = require('../lib/call-archive')
const getResponseObject = require('../lib/get-response-object')
const createMetadata = require('../lib/archive/create-metadata')
const generateDocument = require('../lib/generate-pdf')
const HTTPError = require('../lib/http-error')

module.exports = async (context, req) => {
  logConfig({
    prefix: `${context.invocationId} - ${context.bindingData.sys.methodName}`,
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  if (!req.body) {
    logger('error', ['Please pass a request body'])
    return new HTTPError(400, 'Please pass a request body').toJSON()
  }

  const { system, service, method, secure, options, parameter, template } = req.body
  if (!service && !template) {
    logger('error', ['Missing required parameter "service"'])
    return new HTTPError(400, 'Missing required parameter "service"').toJSON()
  }
  if (!method && !template) {
    logger('error', ['Missing required parameter "method"'])
    return new HTTPError(400, 'Missing required parameter "method"').toJSON()
  }
  if (!parameter && !template) {
    logger('error', ['Missing required parameter "parameter" or "template"'])
    return new HTTPError(400, 'Missing required parameter "parameter" or "template"').toJSON()
  }
  if ((template && !system) || (!template && system)) {
    logger('error', ['Missing required parameter "system" or "template"'])
    return new HTTPError(400, 'Missing required parameter "system" or "template"').toJSON()
  }

  logConfig({
    prefix: `${context.invocationId} - ${context.bindingData.sys.methodName} - ${service} - ${method}${secure ? ' - secure' : ''}`
  })

  try {
    let repacked
    if (template && system) {
      const { pdf, archive } = require(`../templates/${system}-${template}.json`)
      const metadata = createMetadata({ template: archive, documentData: parameter })
      if (pdf) {
        metadata.parameter.Files[0].Base64Data = await generateDocument({ system, template, ...parameter })
      }

      repacked = await callArchive({
        ...metadata,
        extras: options
      })
    } else {
      repacked = await callArchive({
        service,
        method,
        secure,
        parameter,
        extras: options
      })
    }
    return getResponseObject(repacked)
  } catch (error) {
    logger('error', [error])
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(400, error.message).toJSON()
  }
}
