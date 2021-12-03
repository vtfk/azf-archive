const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const callTemplateData = require('../call-template-data')
const hasData = require('../has-data')
const { P360: { robotRecno }, MAIL: { toArchive, toArchiveAdministrator } } = require('../../config')
const HTTPError = require('../http-error')

module.exports = async personData => {
  const { ssn, firstName, lastName, streetAddress, updated, updatedSsn } = personData
  if (!ssn) {
    logger('error', ['Missing required parameter "personData.ssn"'])
    throw new HTTPError(400, 'Missing required parameter "personData.ssn"')
  }
  if (!firstName) {
    logger('error', ['Missing required parameter "personData.firstName"'])
    throw new HTTPError(400, 'Missing required parameter "personData.firstName"')
  }
  if (!lastName) {
    logger('error', ['Missing required parameter "personData.lastName"'])
    throw new HTTPError(400, 'Missing required parameter "personData.lastName"')
  }

  // const syncReadPermissions = require('./syncReadPermissions')

  // First, check if elevmappe already exists
  const elevmappe = await callTemplateData('elevmappe', 'get-elevmappe', personData)
  const elevmappeRes = elevmappe.filter(mappe => hasData(mappe) && mappe.Status !== 'Utgår') // Returns an array of Case-objects where status isn't "Utgår"

  if (elevmappeRes.length >= 1 && elevmappeRes[0].CaseNumber) {
    // Found one elevmappe, update it
    if (elevmappeRes.length > 1) {
      let mailStr = 'Arkiveringsroboten har funnet to elevmapper på samme elev, og trenger at det ryddes i disse for å arkivere automatisk.<br><br><strong>Doble elevmapper:</strong><ul>'
      const caseNumbers = elevmappeRes.map(mappe => {
        mailStr += `<li>${mappe.CaseNumber}</li>`
        return mappe.CaseNumber
      })
      mailStr += `</ul><br>Roboten ønsker seg <strong>${elevmappeRes[0].CaseNumber}</strong> som gjeldende elevmappe.<br><br>Roboten ordner resten selv når dette er ryddet opp.<br><br>Tusen takk!`
      logger('warn', [`Found several elevmapper on ssn ${ssn}`, caseNumbers])
      await sendmail({
        to: toArchive,
        subject: 'Doble elevmapper',
        body: mailStr
      })
    }
    const needsUpdate = (updated || (elevmappeRes[0].Title !== 'Elevmappe') || (elevmappeRes[0].UnofficialTitle !== `Elevmappe - ${firstName} ${lastName}`) || (elevmappeRes[0].Contacts[0].Address.StreetAddress !== streetAddress))

    if (needsUpdate) { // PrivatePerson was updated, update elevmappe as well
      logger('info', ['syncElevmappe', `Elevmappe "${elevmappeRes[0].CaseNumber}" metadata is different from person info (name, ssn, streetAddress), or has wrong case-metadata (title, unofficialTitle)), will update to match person info and case-metadata`])
      if (updatedSsn) {
        logger('info', ['syncElevmappe', 'Elevmappe needs new FNR, sending mail to archive department for manual handling...'])
        const mailStrFnr = `Arkiveringsroboten trenger hjelp med å oppdatere arkivkode FNR på elevmappe <strong>${elevmappeRes[0].CaseNumber}</strong>, siden den ikke klarer å endre arkivkoder selv...<br>Nytt fødselsnummer hentet fra Infotorg er: <strong>${ssn}</strong><br><br>Tusen takk!`
        await sendmail({
          to: toArchiveAdministrator,
          subject: 'Trenger nytt FNR på elevmappe',
          body: mailStrFnr
        })
      }
      return await callTemplateData('elevmappe', 'update-elevmappe', { ...personData, caseNumber: elevmappeRes[0].CaseNumber })
    } else { // PrivatePerson was not updated, don't need to update elevmappe
      logger('info', ['syncElevmappe', `PrivatePerson was not updated, and elevmappe-metadata on case "${elevmappeRes[0].CaseNumber}" was correct, no need to update elevmappe`])
      return { Recno: elevmappeRes[0].Recno, CaseNumber: elevmappeRes[0].CaseNumber }
    }
  } else if (elevmappeRes.length === 0) {
    // No elevmappe found - create one
    return await callTemplateData('elevmappe', 'create-elevmappe', { ...personData, robotRecno })
  } else {
    logger('error', ['syncElevmappe', `Several elevmapper found on social security number: ${ssn}, send to arkivarer for handling`])
    throw new HTTPError(500, `Several elevmapper found on social security number: ${ssn}, send to arkivarer for handling`)
  }
}
