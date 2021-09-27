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

  const { ssn } = req.body
  if (!ssn) {
    logger('error', ['Missing required parameter "ssn"'])
    return new HTTPError(400, 'Missing required parameter "ssn"').toJSON()
  }

  try {
    const dsfData = await getDsfData(ssn)
    const dsfPerson = repackDsfObject(dsfData.RESULT.HOV)
    const privatePerson = await syncPrivatePerson(dsfPerson)
    const elevmappe = await syncElevmappe(privatePerson)
    return getResponseObject({
      msg: 'Succesfully synced elevmappe',
      dsfPerson,
      privatePerson,
      elevmappe
    })
  } catch (error) {
    logger('error', [error])
    if (error instanceof HTTPError) return error.toJSON()
    return getResponseObject(error, 500)
  }
}
