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

  const { siteUrl, projectTitle, responsiblePersonEmail, projectNumber, caseExternalId, caseTitle, accessGroup, paragraph } = req.body
  const input = {
    siteUrl, projectTitle, responsiblePersonEmail, projectNumber, caseExternalId, caseTitle, accessGroup, paragraph
  }
  try {
    if (!siteUrl) {
      throw new HTTPError(400, 'Missing required parameter "siteUrl"')
    }
    if (typeof siteUrl !== 'string') {
      throw new HTTPError(400, '"siteUrl" must be string')
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
    if (typeof responsiblePersonEmail !== 'string') {
      throw new HTTPError(400, '"responsiblePersonEmail" must be string')
    }
    if (!caseExternalId) {
      throw new HTTPError(400, 'Missing required parameter "caseExternalId"')
    }
    if (typeof caseExternalId !== 'string') {
      throw new HTTPError(400, '"caseExternalId" must be string')
    }

    logger('info', `Trying to sync SharePointSite: SiteUrl: ${siteUrl}`)
    const res = await syncSharePointSite(input)
    logger('info', `Succesfully synced SharePointSite. SiteUrl: ${siteUrl}`)
    await roadRunner(req, { status: 'completed', data: res }, context)
    return getResponseObject(res)
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
