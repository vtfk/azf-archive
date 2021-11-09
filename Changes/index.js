const { logConfig, logger } = require('@vtfk/logger')
const getDsfData = require('../lib/dsf/get-dsf-data')
const getResponseObject = require('../lib/get-response-object')
const getChanges = require('../lib/idm/get-changes')
const syncReadPermissions = require('../lib/archive/syncReadPermissions')
const repackDsfObject = require('../lib/dsf/repackDsfObject')
// const setChange = require('../lib/idm/set-change')
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
  try {
    const changes = await getChanges()

    const dsfCache = {}
    const retur = []
    const limit = 10
    const runLength = changes.length >= limit ? limit : changes.length
    for (let i = 0; i < runLength; i++) {
      const change = changes[i]
      logger('info', ['STARTER PÅ NY IDM HENDELISE!!!', change.Id])
      const result = {}

      if (change.IDM_Type === 'Elev') {
        const fnr = change.IDM_KeyValue.split('+')[0]
        try {
          logger('info', ['Henter dsf data for elev', fnr])
          result.dsfData = dsfCache.fnr || await getDsfData(fnr)
          logger('info', ['Fant data', fnr])
          if (result.dsfData.RESULT?.HOV) {
            // Hvis changeType modified value i EmployeeNumber - sett result.dsfData.RESULT.HOV.oldSsn til gammelt fnr
            result.dsfData = repackDsfObject(result.dsfData.RESULT.HOV)
          }
        } catch (error) {
          logger('error', ['DSF error on', change.Id])
          // Gi beskjed til Teams
          // sett til håndtert i IDM
          continue
        }
        if (!dsfCache.fnr) dsfCache[fnr] = result.dsfData

        // Create or Update PrivatePerson
        try {
          logger('info', ['Synkroniserer privatperson for elev', result.dsfData.firstName, result.dsfData.lastName])
          result.privatePerson = await syncPrivatePerson(result.dsfData)
          logger('info', ['Synkroniserte elev', result.privatePerson])
        } catch (error) {
          logger('error', ['SyncPrivatePerson error on', change.Id])
          // Gjør noe her?
          continue
        }
        // Create or Update Elevmappe
        try {
          logger('info', ['Synkroniserer elevmappe for elev', fnr])
          result.elevmappe = await syncElevmappe(result.dsfData)
          logger('info', ['Synkroniserte elevmappe', result.elevmappe])
        } catch (error) {
          logger('error', ['SyncElevmappe error on', change.Id])
          // Gjør noe her?
          continue
        }
        // If new school syncReadPermissions
        if (change.IDM_ChangeType === 'ModifyValue' && change.IDM_AttributeName === 'sasOrganizationalUnitCSV') {
          const oldValues = change.IDM_OldValue.split(',')
          const newValues = change.IDM_NewValue.split(',')
          const actualNewValues = newValues.filter(school => !oldValues.includes(school))
          if (actualNewValues.length > 0) {
            logger('info', ['Fant ny skole på elev, ', actualNewValues])
            result.permission = await syncReadPermissions(result.elevmappe.CaseNumber, actualNewValues)
            retur.push({ ssn: result.dsfData.ssn, docNumbers: result.permission, newSchools: actualNewValues })
          }
        }
      }
      if (change.IDM_Type === 'Ansatt') {
        // dra ut hver og en av disse i modules
        // hvis det er mandag - hent ut alt som har skjedd, send e-post til arkivarer
      }
    }
    return getResponseObject(retur)
  } catch (error) {
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(400, error.message).toJSON()
  }
}
