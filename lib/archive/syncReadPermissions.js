const { logger } = require('@vtfk/logger')
const xml2js = require('xml2js')
const vtfkSchools = require('vtfk-schools-info')
const getDocuments = require('./CRUD/get-documents')
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

module.exports = async (elevmappeCaseNumber, activeSchools) => {
  if (!activeSchools) {
    logger('error', ['Missing required parameter "activeSchools"'])
    throw new HTTPError(400, 'Missing required parameter "activeSchools"')
  }
  if (!elevmappeCaseNumber) {
    logger('error', ['Missing required parameter "elevmappeCaseNumber"'])
    throw new HTTPError(400, 'Missing required parameter "elevmappeCaseNumber"')
  }

  const documentsToChange = [] // list of document numbers

  // Hent alle dokumenter i saken - med rettighetsmatrise
  const documentsRes = await getDocuments({
    caseNumber: elevmappeCaseNumber,
    filter: doc => doc.StatusCode !== 'U' // Les rettighetsmatrise - sjekk om dokumentet skal ha nye rettigheter (må defineres NÅR de skal ha nye rettigheter)
  }) // Returns an array of PrivatePerson-objects

  for (const doc of documentsRes) {
    if (await checkPermissions(doc.DocumentRowPermissions)) {
      documentsToChange.push(doc)
    }
  }

  // For hvert dokument som skal gis leserettigheter til - gi det til den nye skolen

  // Ferdig
  return documentsToChange // endre til noe som gir mening
}
