const { logger } = require('@vtfk/logger')
const xml2js = require('xml2js')
const vtfkSchools = require('vtfk-schools-info')
const callTemplateData = require('../call-template-data')
const HTTPError = require('../http-error')

const checkPermissions = async documentRowPermissions => {
  const xml = await xml2js.parseStringPromise(documentRowPermissions)
  for (const record of xml.RECORDS.RECORD) {
    if (record.Permissions.includes('Vis fil')) {
      const options = {
        accessGroup: record.Grantee
      }
      if (vtfkSchools(options).length === 1) {
        return true
      }
    }
  }
  return false
}

module.exports = async (caseNumber, activeSchools) => {
  if (!activeSchools) {
    logger('error', ['Missing required parameter "activeSchools"'])
    throw new HTTPError(400, 'Missing required parameter "activeSchools"')
  }
  if (!caseNumber) {
    logger('error', ['Missing required parameter "caseNumber"'])
    throw new HTTPError(400, 'Missing required parameter "caseNumber"')
  }

  const documentsToChange = [] // list of document numbers

  // Hent alle dokumenter i saken - med rettighetsmatrise
  const documents = await callTemplateData('elevmappe', 'get-documents', { caseNumber }) // Returns an array of PrivatePerson-objects
  const documentsRes = documents.filter(doc => doc.StatusCode !== 'U') // Les rettighetsmatrise - sjekk om dokumentet skal ha nye rettigheter (må defineres NÅR de skal ha nye rettigheter)

  for (const doc of documentsRes) {
    if (await checkPermissions(doc.DocumentRowPermissions)) {
      documentsToChange.push(doc)
    }
  }

  // For hvert dokument som skal gis leserettigheter til - gi det til den nye skolen

  // Ferdig
  return documentsToChange // endre til noe som gir mening
}
