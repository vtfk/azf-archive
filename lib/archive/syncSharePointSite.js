const { logger } = require('@vtfk/logger')
const callTemplateData = require('../call-template-data')
const sendmail = require('../send-mail')
const { MAIL: { toArchiveAdministrator } } = require('../../config')

module.exports = async sharePointData => {
  let { siteUrl, projectTitle, responsiblePersonEmail, projectNumber, caseExternalId, caseTitle, accessGroup, paragraph, caseType } = sharePointData
  const result = {}
  const status = {
    project: false,
    case: false
  }

  // PROJECT
  if ((projectNumber && projectNumber.toLowerCase() === 'nei') || !projectNumber) {
    // project does not exists. Need to create
    logger('info', ['syncSharePointSite', 'createProject'])
    const createProject = await callTemplateData('sharepoint', 'create-project', { siteUrl, projectTitle, responsiblePersonEmail }) // Returns projectNumber from 360
    result.projectNumber = createProject.ProjectNumber
    result.responsiblePersonEmail = responsiblePersonEmail
    status.project = 'successfully created'
    logger('info', ['syncSharePointSite', `Project created. Project number: ${result.projectNumber}`])
  } else { // contains project number. External ID cannot be updated. Only responisblePerson and Title.
    logger('info', ['syncSharePointSite', `project already exists. Project number: ${projectNumber}`])
    const getProject = await callTemplateData('sharepoint', 'get-project', { projectNumber }) // Returns projectNumber from 360
    if (!getProject.ProjectNumber) throw new Error(`Project "${projectNumber}" does not exist.`)
    result.projectNumber = getProject.ProjectNumber
    result.responsiblePersonEmail = getProject.ResponsiblePerson.Email
    status.project = 'found'
    logger('info', `Found project. Projectnumber: ${result.projectNumber}`)
  }
  result.projectName = projectTitle

  // CASE
  const getCase = await callTemplateData('sharepoint', 'get-case', { caseExternalId }) // Returns caseNumber from 360
  if (getCase.CaseNumber) {
    // do not update case if exists
    if (getCase.Status === 'Utgår') {
      // Send mail til 360 administrator om at dette er en adressesperring, som manglet dette i 360
      const mailStrBlock = `Arkiveringsroboten fant en SharePoint-sak som var satt til Utgår i Public 360.<br>Kan dere sette den til riktig status? Roboten vil legge til et dokument i saken, sannsynligvis lenge før du leser denne eposten.... :-)  <br><br>Saken det gjelder har <strong>Saksnummer: ${getCase.CaseNumber}</strong>`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'Oppdaget SharePoint-sak med status Utgår',
        body: mailStrBlock
      })
      logger('warn', ['syncSharePointSite', `Found case in P360 but status is Utgår. Will use the case anyway. Case number: ${getCase.CaseNumber}. Sent mail to archive administrators`])
    }
    logger('info', ['syncSharePointSite', `Case already exists. Case number: ${getCase.CaseNumber}`])
    result.caseNumber = getCase.CaseNumber
    result.caseTitle = getCase.Title
    status.case = 'found'
  } else {
    logger('info', ['syncSharePointSite', 'createCase'])
    if (!accessGroup) accessGroup = 'Alle' // Set default if not set
    if (!paragraph) paragraph = '' // Set default if not set
    const template = caseType ? `create-case-${caseType}` : 'create-case'
    const createCase = await callTemplateData('sharepoint', template, { caseTitle, projectNumber: result.projectNumber, caseExternalId, accessGroup, paragraph, responsiblePersonEmail: result.responsiblePersonEmail }) // Returns caseNumber from 360
    result.caseNumber = createCase.CaseNumber
    result.caseTitle = caseTitle
    status.case = 'successfully created'
    logger('info', ['syncSharePointSite', `Case created. Case number: ${result.caseNumber}`])
  }

  // Set result.msg with status
  result.msg = `Project ${status.project}. Case ${status.case}`

  return result
}
