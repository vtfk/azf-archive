const { logConfig, logger } = require('@vtfk/logger')
const { create: roadRunner } = require('@vtfk/e18')
const getResponseObject = require('../lib/get-response-object')
const syncSharePointSite = require('../lib/archive/syncSharePointSite')
const HTTPError = require('../lib/http-error')

module.exports = async function (context, req) {
  logConfig({
    prefix: `${context.invocationId} - ${context.bindingData.sys.methodName}`,
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  const { siteURL, projectTitle, responsiblePersonEmail, projectNumber, caseExternalId, caseTitle, accessGroup, paragraph } = req.body
  const input = {
    siteURL, projectTitle, responsiblePersonEmail, projectNumber, caseExternalId, caseTitle, accessGroup, paragraph
  }
  let result = {}
  try {
    if (!siteURL) {
      throw new HTTPError(400, 'Missing required parameter "siteURL"')
    }
    if (typeof siteURL !== 'string') {
      throw new HTTPError(400, '"siteURL" must be string')
    }
    if (!caseTitle) {
      throw new HTTPError(400, 'Missing required parameter "caseTitle"')
    }
    if (typeof caseTitle !== 'string') {
      throw new HTTPError(400, '"caseTitle" must be string')
    }
    if (!projectTitle) {
      throw new HTTPError(400, 'Missing required parameter "projectTitle"')
    }
    if (typeof projectTitle !== 'string') {
      throw new HTTPError(400, '"projectTitle" must be string')
    }
    if (!responsiblePersonEmail) {
      throw new HTTPError(400, 'Missing required parameter "responsiblePersonEmail"')
    }
    logger('info', `Trying to sync SharePointSite: SiteURL: ${siteURL}`)
    const res = await syncSharePointSite(input)
    logger('info', `Succesfully synced SharePointSite. SiteURL: ${siteURL}`)
    result = { msg: 'Succesfully synced SharePointSite', ...res }
    await roadRunner(req, { status: 'completed', data: result }, context)
    return getResponseObject(result)
  } catch (error) {
    if (typeof error === 'object') {
      delete error.config
    }
    const data = error.response?.data || error instanceof HTTPError ? error.toJSON() : error
    const status = (error.response && error.response.status) || error.statusCode || 500
    await roadRunner(req, { status: 'failed', error: data }, context)

    if (error instanceof HTTPError) {
      logger('error', [status, error.innerError || error.message])
      return error.toJSON()
    }
    logger('error', [status, error])
    if (typeof error === 'object') {
      error.error = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    }
    return getResponseObject(error, status)
  }
}
