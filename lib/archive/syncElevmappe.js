const { logger } = require('@vtfk/logger')
const createElevmappe = require('./CRUD/create-elevmappe')
const getElevmappe = require('./CRUD/get-elevmappe')
const updateElevmappe = require('./CRUD/update-elevmappe')
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
  const elevmappeRes = await getElevmappe(personData) // Returns an array of Case-objects where status isn't "Utgår"

  if (elevmappeRes.length === 1 && elevmappeRes[0].CaseNumber) {
    // Found one elevmappe, update it
    return await updateElevmappe({ ...personData, caseNumber: elevmappeRes[0].CaseNumber })
    /* if (options.updateReadPermissions) {
      console.log('Update readPermissions')
      // oijk
    } */
  } else if (elevmappeRes.length === 0) {
    // No elevmappe found - create one
    return await createElevmappe(personData)
  } else {
    logger('error', ['syncElevmappe', `Several elevmapper found on social security number: ${ssn}, send to arkivarer for handling`])
    throw new HTTPError(500, `Several elevmapper found on social security number: ${ssn}, send to arkivarer for handling`)
  }
}
