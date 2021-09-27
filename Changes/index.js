const { logConfig, logger } = require('@vtfk/logger')
const getDsfData = require('../lib/dsf/get-dsf-data')
const getResponseObject = require('../lib/get-response-object')
const getChanges = require('../lib/idm/get-changes')
// const setChange = require('../lib/idm/set-change')

module.exports = async function (context, req) {
  logConfig({
    prefix: `${context.invocationId} - ${context.bindingData.sys.methodName}`,
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  const changes = await getChanges()

  const dsfCache = []
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i]

    if (change.IDM_Type === 'Elev') {
      const fnr = change.IDM_KeyValue.split('+')[0]

      const dsfData = dsfCache.find(dsf => dsf.fnr === fnr) || await getDsfData(fnr)
      if (!dsfData) {
        logger('error', ['DSF error on', change.Id])
        continue
      } else if (!dsfData.fnr) dsfCache.push({ fnr, data: dsfData.RESULT.HOV })

      // Create or Update PrivatePerson

      // Create or Update Elevmappe
    }
  }

  return getResponseObject(changes)
}
