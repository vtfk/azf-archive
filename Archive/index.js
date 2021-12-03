const { logConfig, logger } = require('@vtfk/logger')
const callArchive = require('../lib/call-archive')
const getResponseObject = require('../lib/get-response-object')
const createMetadata = require('../lib/create-metadata')
const generateDocument = require('../lib/generate-pdf')
const HTTPError = require('../lib/http-error')
const setE18Stats = require('../lib/set-e18-stats')

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
    await setE18Stats(undefined, undefined, { status: 'failed', error: 'Please pass a request body' })
    return new HTTPError(400, 'Please pass a request body').toJSON()
  }

  const { service, method, secure, options, system, template, parameter, jobId, taskId } = req.body
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
    await setE18Stats(jobId, taskId, { status: 'completed', data: result })
    return getResponseObject(result)
  } catch (error) {
    if (error.response && error.response.data) {
      const { data } = error.response
      await setE18Stats(jobId, taskId, { status: 'failed', error: data, message: data.message })
    } else {
      await setE18Stats(jobId, taskId, { status: 'failed', error, message: error.message })
    }

    if (error instanceof HTTPError) {
      logger('error', [error.message])
      return error.toJSON()
    }
    logger('error', [error])
    return getResponseObject(error, 500)
  }
}
