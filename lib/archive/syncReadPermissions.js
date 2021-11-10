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

  const result = []

  const activeSchoolsList = activeSchools.map(school => vtfkSchools({ fullName: school })).flat() //

  const documentsToChange = [] // list of document numbers to change and schools to give permission to

  // Hent alle dokumenter i saken - med rettighetsmatrise
  try {
    const documents = await callTemplateData('elevmappe', 'get-documents', { caseNumber })
    const documentsRes = documents.filter(doc => doc.StatusCode !== 'U')

    for (const doc of documentsRes) {
      for (const newSchool of activeSchoolsList) {
        if (await checkPermissions(doc, newSchool.accessGroup)) {
          if (!documentsToChange.includes(doc.DocumentNumber)) {
            documentsToChange.push({ documentNumber: doc.DocumentNumber, accessGroup: newSchool.accessGroup })
          }
        }
      }
    }
    for (const docPermissions of documentsToChange) {
      // give permission
      logger('info', ['Granting read permissions do p360 document', docPermissions])
      const permissions = await callTemplateData('elevmappe', 'grant-read-permission', docPermissions)
      result.push({ ...permissions, school: docPermissions.accessGroup })
      logger('info', [`Permission given to school ${docPermissions.accessGroup} for documentNumber ${permissions.DocumentNumber}`])
    }
    // Ferdig
    return result // endre til noe som gir mening
  } catch (error) {
    if (error.statusCode === 404) logger('error', ['Elevmappe has no documents'])
    else logger('error', ['Error on syncReadPermissions', error])
  }

  // Ferdig
  return result
}
