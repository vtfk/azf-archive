const { logger } = require('@vtfk/logger')
const vtfkSchools = require('vtfk-schools-info')
const callTemplateData = require('../call-template-data')
const HTTPError = require('../http-error')
const checkPermissions = require('./checkPermissions')

module.exports = async (caseNumber, activeSchools) => {
  if (!activeSchools) {
    logger('error', ['Missing required parameter "activeSchools"'])
    throw new HTTPError(400, 'Missing required parameter "activeSchools"')
  }
  if (!caseNumber) {
    logger('error', ['Missing required parameter "caseNumber"'])
    throw new HTTPError(400, 'Missing required parameter "caseNumber"')
  }

  const activeSchoolsList = activeSchools.map(school => vtfkSchools({ fullName: school.split(' | ')[0] })).flat()

  const documentsToChange = [] // list of document numbers

  // Hent alle dokumenter i saken - med rettighetsmatrise
  try {
    const documents = await callTemplateData('elevmappe', 'get-documents', { caseNumber }) // Returns an array of PrivatePerson-objects
    const documentsRes = documents.filter(doc => doc.StatusCode !== 'U') // Les rettighetsmatrise - sjekk om dokumentet skal ha nye rettigheter (må defineres NÅR de skal ha nye rettigheter)

    for (const doc of documentsRes) {
      for (const newSchool of activeSchoolsList) {
        if (await checkPermissions(doc, newSchool.accessGroup)) {
          if (!documentsToChange.includes(doc.DocumentNumber)) {
            documentsToChange.push(doc.DocumentNumber)
          }
        }
      }
    }
    for (const doc of documentsToChange) {
      // give permission
      console.log(`gave permission to ${doc}`)
    }
    // Ferdig
    return documentsToChange // endre til noe som gir mening
  } catch (error) {
    if (error.statusCode === 404) logger('error', ['Elevmappe has no documents'])
    else logger('error', ['Error on syncReadPermissions', error])
  }

  // Ferdig
  return documentsToChange // endre til noe som gir mening
}
