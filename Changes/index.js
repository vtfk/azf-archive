const { logConfig, logger } = require('@vtfk/logger')
const getDsfData = require('../lib/dsf/get-dsf-data')
const getResponseObject = require('../lib/get-response-object')
const getChanges = require('../lib/idm/get-changes')
const syncReadPermissions = require('../lib/archive/syncReadPermissions')
const repackDsfObject = require('../lib/dsf/repackDsfObject')
// const setChange = require('../lib/idm/set-change')
const syncPrivatePerson = require('../lib/archive/syncPrivatePerson')
const syncElevmappe = require('../lib/archive/syncElevmappe')

module.exports = async function (context, req) {
  logConfig({
    prefix: `${context.invocationId} - ${context.bindingData.sys.methodName}`,
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  const changes = await getChanges()

  // const resList = []
  // for (let i=0; i<10; i++) {
  //   if (changes[i].IDM_Type === "Elev" && changes[i].IDM_ChangeType === "ModifyValue" && changes[i].IDM_AttributeName === "sasOrganizationalUnitCSV") {
  //     console.log("Vi er på "+i)
  //     try {
  //       const test = await syncReadPermissions('21/00068', changes[i].IDM_NewValue)
  //       resList.push({school: changes[i].IDM_NewValue, status: "Success", documentsToChange: test})
  //     } catch (error) {
  //       console.log(error)
  //       resList.push({school: changes[i].IDM_NewValue, status: "FAIIILL", error: error.toString()})
  //     }
  //   }
  // }

  const dsfCache = {}
  const retur = []
  for (let i = 0; i < 50; i++) {
    const change = changes[i]
    logger('info', ['STARTER PÅ NY IDM HENDELISE!!!', change.Id])
    const result = {}

    if (change.IDM_Type === 'Elev') {
      const fnr = change.IDM_KeyValue.split('+')[0]
      try {
        logger('info', ['Henter dsf data for elev', fnr])
        result.dsfData = dsfCache.fnr || await getDsfData(fnr)
        logger('info', ['Fant data', result.dsfData])
        if (result.dsfData.RESULT?.HOV) {
          result.dsfData = repackDsfObject(result.dsfData.RESULT.HOV)
        } else {
          console.log('henta fra cachek')
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
        console.log(oldValues)
        const newValues = change.IDM_NewValue.split(',')
        console.log(newValues)
        newValues.forEach(element => {
          console.log(typeof element)
        })
        const actualNewValues = newValues.filter(school => !oldValues.includes(school))
        if (actualNewValues.length > 0) {
          console.log(actualNewValues)
          logger('info', ['Fant ny skole elev på elev, jada', actualNewValues])
          result.permission = await syncReadPermissions(result.elevmappe.CaseNumber, actualNewValues)
          retur.push(result)
        }
      }
    }
    if (change.IDM_Type === 'Ansatt') {
      // dra ut hver og en av disse i modules
      // hvis det er mandag - hent ut alt som har skjedd, send e-post til arkivarer
    }
  }
  return getResponseObject(retur)
}
