const { logConfig, logger } = require('@vtfk/logger')
const { create: roadRunner } = require('@vtfk/e18')
const callArchive = require('../lib/call-archive')
const getResponseObject = require('../lib/get-response-object')
const createMetadata = require('../lib/create-metadata')
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
  try {
    if (!service && !method && !system && !template) {
      throw new HTTPError(400, 'Missing required parameters. Check documentation')
    }
    if ((service && !method) || (!service && method) || ((service || method) && !parameter)) {
      throw new HTTPError(400, 'Missing required parameter for raw SIF call. Check documentation')
    }
    if ((system && !template) || (!system && template) || ((system || template) && !parameter)) {
      throw new HTTPError(400, 'Missing required parameter for template call. Check documentation')
    }

    logConfig({
      prefix: `${context.invocationId} - ${context.bindingData.sys.methodName} - ${service || system} - ${method || template}${secure ? ' - secure' : ''}`
    })

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
    await roadRunner(req, { status: 'completed', data: result }, context)
    return getResponseObject(result)
  } catch (error) {
    if (typeof error === 'object') {
      delete error.config
    }
    const data = error instanceof HTTPError ? error.toJSON() : error
    const message = error instanceof HTTPError ? error.message : (error.message || undefined)
    const status = (error.response && error.response.status) || error.statusCode || 500
    await roadRunner(req, { status: 'failed', error: data, message }, context)

    if (message) {
      logger('error', [status, message])
    }
    logger('error', [status, error])
    if (typeof error === 'object') {
      error.error = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    }
    return getResponseObject(error, status)
  }
}
