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

  const { service, method, secure, options, system, template, parameter } = req.body
  if (!service && !method && !system && !template) {
    logger('error', ['Missing required parameters. Check documentation'])
    return new HTTPError(400, 'Missing required parameters. Check documentation').toJSON()
  }
  if ((service && !method) || (!service && method) || ((service || method) && !parameter)) {
    logger('error', ['Missing required parameter for raw SIF call. Check documentation'])
    return new HTTPError(400, 'Missing required parameter for raw SIF call. Check documentation').toJSON()
  }
  if ((system && !template) || (!system && template) || ((system || template) && !parameter)) {
    logger('error', ['Missing required parameter for template call. Check documentation'])
    return new HTTPError(400, 'Missing required parameter for template call. Check documentation').toJSON()
  }

  logConfig({
    prefix: `${context.invocationId} - ${context.bindingData.sys.methodName} - ${service || system} - ${method || template}${secure ? ' - secure' : ''}`
  })

  try {
    let data = { service, method, secure, parameter, extras: options }
    if (system && template) {
      const { pdf, archive } = require(`../templates/${system}-${template}.json`)
      const metadata = createMetadata({ template: archive, documentData: parameter })
      if (pdf) {
        // TODO: Add support for multiple files
        metadata.parameter.Files[0].Base64Data = await generateDocument({ system, template, ...parameter })
      }
      data = { ...metadata, extras: options }
    }
    const result = await callArchive(data)
    return getResponseObject(result)
  } catch (error) {
    logger('error', [error])
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(400, error.message).toJSON()
  }
}
