const { logger } = require('@vtfk/logger')
const callTemplateData = require('../call-template-data')

module.exports = async sharePointData => {
  let { siteURL, projectTitle, responsiblePersonEmail, projectNumber, caseExternalId, caseTitle, accessGroup, paragraph } = sharePointData
  const result = {}

  // PROJECT
  if ((projectNumber && projectNumber.toLowerCase() === 'nei') || !projectNumber) {
    // project does not exists. Need to create
    logger('info', ['syncSharePointSte', 'createProject'])
    const createProject = await callTemplateData('sharepoint', 'create-project', { siteURL, projectTitle, responsiblePersonEmail }) // Returns projectNumber from 360
    result.projectNumber = createProject.ProjectNumber
    logger('info', ['syncSharePointSte', `Project created. Project number: ${result.projectNumber}`])
  } else { // contains project number. External ID cannot be updated. Only responisblePerson and Title.
    logger('info', ['syncSharePointSte', `project already exists. Project number: ${projectNumber}`])
    const updateProject = await callTemplateData('sharepoint', 'update-project', { projectNumber, projectTitle, responsiblePersonEmail }) // Returns projectNumber from 360
    result.projectNumber = updateProject.ProjectNumber
    logger('info', `Project successfully updated. Projectnumber: ${result.projectNumber}`)
  }
  result.projectName = projectTitle

  // CASE
  const getCase = await callTemplateData('sharepoint', 'get-case', { caseExternalId }) // Returns caseNumber from 360
  if (getCase.CaseNumber) {
    // do not update case if exists
    logger('info', ['syncSharePointSte', `Case already exists. Case number: ${getCase.CaseNumber}`])
    result.caseNumber = getCase.CaseNumber
    result.caseTitle = getCase.Title
  } else {
    logger('info', ['syncSharePointSte', 'createCase'])
    if (!accessGroup) accessGroup = 'Alle'
    if (!paragraph) paragraph = ''
    const createCase = await callTemplateData('sharepoint', 'create-case', { caseTitle, projectNumber: result.projectNumber, caseExternalId, accessGroup, paragraph, responsiblePersonEmail }) // Returns projectNumber from 360
    result.caseNumber = createCase.CaseNumber
    result.caseTitle = caseTitle
    logger('info', ['syncSharePointSte', `Case created. Case number: ${result.caseNumber}`])
  }

  return result
}
