const { logger } = require('@vtfk/logger')
const callTemplateData = require('../call-template-data')
const hasData = require('../has-data')
const { P360: { robotRecno } } = require('../../config')
const HTTPError = require('../http-error')

module.exports = async personData => {
  const { ssn, firstName, lastName } = personData
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
    const caseNumbers = elevmappeRes.map(mappe => mappe.CaseNumber)
    if (elevmappeRes.length > 1) logger('warn', [`Found several elevmapper on ssn ${ssn}`, caseNumbers])
    return await callTemplateData('elevmappe', 'update-elevmappe', { ...personData, caseNumber: elevmappeRes[0].CaseNumber, caseNumbers })
    /* if (options.updateReadPermissions) {
      console.log('Update readPermissions')
      // oijk
    } */
  } else if (elevmappeRes.length === 0) {
    // No elevmappe found - create one
    return await callTemplateData('elevmappe', 'create-elevmappe', { ...personData, robotRecno })
  } else {
    logger('error', ['syncElevmappe', `Several elevmapper found on social security number: ${ssn}, send to arkivarer for handling`])
    throw new HTTPError(500, `Several elevmapper found on social security number: ${ssn}, send to arkivarer for handling`)
  }
}
