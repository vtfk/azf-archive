const { logger, logConfig } = require('@vtfk/logger')
const getResponseObject = require('../lib/get-response-object')
const HTTPError = require('../lib/http-error')
const generateDocument = require('../lib/pdf/generate-pdf')
const archiveDocument = require('../lib/archive/CRUD/create-document')

module.exports = async function (context, req) {
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

  const options = req.body

  try {
    const document = await generateDocument(options)
    const archived = await archiveDocument({
      ...options,
      file: {
        data: document,
        title: options.title
      }
    })

    return getResponseObject({
      msg: 'Succesfully created document',
      archived
    })
  } catch (error) {
    logger('error', [error])
    if (error instanceof HTTPError) return error.toJSON()
    return getResponseObject(error, 500)
  }
}
