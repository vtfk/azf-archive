const { logConfig, logger } = require('@vtfk/logger')
const getDsfData = require('../lib/dsf/get-dsf-data')
const repackDsfObject = require('../lib/dsf/repackDsfObject')
const getResponseObject = require('../lib/get-response-object')
const syncPrivatePerson = require('../lib/archive/syncPrivatePerson')
const syncElevmappe = require('../lib/archive/syncElevmappe')
const HTTPError = require('../lib/http-error')

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
  if (!req.body.birthnr) {
    logger('error', ['Missing required parameter "birthnr"'])
    return new HTTPError(400, 'Missing required parameter "birthnr"').toJSON()
  }

  const birthnr = req.body.birthnr

  try {
    const dsfData = await getDsfData(birthnr)
    const dsfPerson = repackDsfObject(dsfData.RESULT.HOV)
    const privatePerson = await syncPrivatePerson(dsfPerson)
    const elevmappe = await syncElevmappe(privatePerson)
    const resObject = {
      msg: 'Succesfully synced elevmappe',
      dsfPerson,
      privatePerson,
      elevmappe
    }
    return getResponseObject(resObject)
  } catch (error) {
    logger('error', [error])
    if (error instanceof HTTPError) return error.toJSON()
    return getResponseObject(error, 500)
  }
}
