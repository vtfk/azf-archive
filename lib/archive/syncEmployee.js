const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const callTemplateData = require('../call-template-data')
const { MAIL: { toArchiveAdministrator, toArchive7011 }, ACCESSGROUP_EXCEPTIONS } = require('../../config')
const HTTPError = require('../http-error')

module.exports = async (personData, upn, manager, allowNullValues) => {
  const { ssn, firstName, lastName } = personData
  const { displayName, companyName, department, onPremisesUserPrincipalName } = manager
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
  if (!onPremisesUserPrincipalName) {
    logger('error', ['Missing required parameter "manager.onPremisesUserPrincipalName"'])
    throw new HTTPError(400, 'Missing required parameter "manager.onPremisesUserPrincipalName"')
  }
  if (typeof allowNullValues !== 'boolean') {
    logger('error', ['Nokon har kuka med parameter "allowNullValues"'])
    throw new HTTPError(500, 'Nokon har kuka med parameter "allowNullValues""')
  }

  // First, get manager contact from P360
  const result = {
    upn
  }
  let canContinue = true
  const archiveManagerRes = await callTemplateData('contact', 'get-contact-persons', { email: onPremisesUserPrincipalName })
  if (archiveManagerRes.length === 0) {
    logger('warn', [`Manager ${onPremisesUserPrincipalName} has no user in P360 - cannot continue :(`])
    const mailStr = `Halla!<br><br>Arkiveringsroboten kunne ikke finne 360-bruker for leder "${displayName}" ved søk på e-post (${onPremisesUserPrincipalName}).<br>Brukeren ${displayName} jobber i ${department} - ${companyName}.<br><br>Kunne dere ha opprettet bruker eller satt korrekt e-postadresse på kontaktpersonen for lederen, slik at arkiveringsroboten får arkivert? 😎<br>`
    await sendmail({
      to: toArchiveAdministrator,
      subject: 'Leder mangler bruker i P360',
      body: mailStr
    })
    if (!allowNullValues) {
      throw new HTTPError(500, 'Manager does not have P360 user, mail have been sent to archive')
    } else {
      canContinue = false
      result.manager = null
      result.enterpriseNumber = null
      result.enterpriseName = null
    }
  } else if (archiveManagerRes.length > 1) {
    logger('warn', [`Manager ${onPremisesUserPrincipalName} has several contactpersons on the same email in P360 - cannot continue :(`])
    const mailStr = `Heisann!<br><br>Arkiveringsroboten fant flere kontaktpersoner på leder "${displayName}" (${onPremisesUserPrincipalName}).<br>Brukeren ${displayName} jobber i ${department} - ${companyName}.<br><br>Kunne dere ha ordnet så det kun er en kontaktperson med denne e-postadressen? 🤔`
    await sendmail({
      to: toArchiveAdministrator,
      subject: 'Leder har flere kontaktpersoner i P360',
      body: mailStr
    })
    if (!allowNullValues) {
      throw new HTTPError(500, 'Manager have several contactpersons in P360, mail have been sent to archive')
    } else {
      canContinue = false
      result.manager = null
      result.enterpriseNumber = null
      result.enterpriseName = null
    }
  } else {
    result.manager = onPremisesUserPrincipalName
    if (!archiveManagerRes[0].Enterprise || archiveManagerRes[0].Enterprise.length < 3) {
      logger('warn', [`Manager ${onPremisesUserPrincipalName} has no connection to any enterprise`])
      const mailStr = `Halloisen!<br><br>Arkiveringsroboten fant ikke noe organisasjonsummer på virksomheten der "${displayName}" (${onPremisesUserPrincipalName}) er ansatt.<br>${displayName} jobber i ${department} - ${companyName}.<br><br>Kunne dere ha ordnet organisajonsnummer på virksomheten lederen er ansatt i (i 360)? 😵`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'Intern virksomhet mangler organisasjonsnummer',
        body: mailStr
      })
      if (!allowNullValues) {
        throw new HTTPError(500, 'Enterprise is missing orgnumber in P360, mail have been sent to archive')
      } else {
        canContinue = false
        result.enterpriseNumber = null
        result.enterpriseName = null
      }
    } else {
      logger('info', [`Found enterprise number ${archiveManagerRes[0].Enterprise} for manager ${onPremisesUserPrincipalName}`])
      result.enterpriseNumber = archiveManagerRes[0].Enterprise
    }
  }

  // Then, get the enterprise from p360
  if (canContinue) {
    const enterpriseRes = await callTemplateData('contact', 'get-enterprise', { orgnr: result.enterpriseNumber })
    if (enterpriseRes.length === 0) {
      // Ånei, enterprisen mangler i 360 - noe er veldig galt
      logger('error', [`There is no enterprise with enterprisenumber ${result.enterpriseNumber}`])
      throw new HTTPError(500, `No enterprise found with enterprisenumber ${result.enterpriseNumber}`)
    } else if (enterpriseRes.length > 1) {
      // Ånei, flere enterpriser med samme orgnr, send mail til arkiv -plukk den første og bruk den
      logger('warn', [`Several enterprises found with enterprisenumber ${result.enterpriseNumber}`])
      const mailStr = `Hei!<br><br>Arkiveringsroboten fant flere virksomheter med organisajonsnummer "${result.enterpriseNumber}"<br><br>Kunne dere ha ordnet så det blir riktig (helst en virksomhet per organisasjonsnummer, hvis ikke blir roboten veldig forvirret...)? 😁`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'Fant flere virksomheter med samme organisasjonsnummer',
        body: mailStr
      })
      result.enterpriseName = enterpriseRes[0].Name
    } else {
      result.enterpriseName = enterpriseRes[0].Name
    }
    logger('info', [`Found enterprise ${result.enterpriseName} on enterprise number ${result.enterpriseNumber}`])

    const accessGroupsRes = await callTemplateData('accessGroup', 'get-accessGroups', {})
    if (accessGroupsRes.length === 0) {
      // Ånei, ingen tilgangsgrupper - noe er veldig galt kjør error
      throw new HTTPError(500, 'No access groups found - something is very wrong...')
    } else {
      // Gå gjennom accessGroups og finn de som tilhører enheten
      const cleanAccessGroup = (accessGroup) => {
        // Ikke spør...
        const cleanedAccessGroup = accessGroup.toLowerCase()
          .replace('sektor for ', '')
          .replace('seksjon for ', '')
          .replace('utviklingsenhet for ')
          .replace('sektor ', '')
          .replace('videregående skole', 'vgs')
          .replace('vidaregåande skule', 'vgs')
          .replace(' ', '')
          .replace('-', '')
        return cleanedAccessGroup
      }
      const findAccessGroup = (type) => {
        return accessGroupsRes.find(unit => cleanAccessGroup(unit.Code) === cleanAccessGroup(`${type} ${result.enterpriseName}`))
      }
      const getExceptionAccessGroup = (type) => {
        const exceptionGroups = ACCESSGROUP_EXCEPTIONS[result.enterpriseNumber]
        if (exceptionGroups) {
          return exceptionGroups[type]
        }
        return exceptionGroups
      }

      const missingGroups = []
      // Finn personal
      let personal = findAccessGroup('Personal')?.Code
      if (!personal) {
        personal = getExceptionAccessGroup('personal')
        if (!personal) {
          missingGroups.push(`Personal tilgangsgruppe for ${result.enterpriseName}`)
        }
      }
      // Finn lønn
      let lonn = findAccessGroup('Lønn')?.Code
      if (!lonn) {
        lonn = getExceptionAccessGroup('lonn')
        if (!lonn) {
          missingGroups.push(`Lønn tilgangsgruppe for ${result.enterpriseName}`)
        }
      }
      // Finn default (Skru på denne den dagen du trenger det)
      /*
      let defaultAccessGroup = findAccessGroup('')
      if (!defaultAccessGroup) {
        missingGroups.push(`${result.enterpriseName}`)
        defaultAccessGroup = getExceptionAccessGroup('defaultAccessGroup')
        if (!defaultAccessGroup) throw new HTTPError(500, `Missing accessgroup defaultAccessGroup ${result.enterpriseName}`)
      }
      */
      if (missingGroups.length > 0) {
        // Send mail til arkiv om at vi ikke fant tilgangsgrupper
        logger('warn', [`Missing accessgroups for ${result.enterpriseName}`, missingGroups])
        const mailStr = `Hei, arkiv-genier! 🤠<br><br>Arkiveringsroboten kunne ikke finne personaldokumentasjons-tilgangsgrupper for "${result.enterpriseName}"<br><br>Kunne dere ha sjekka om de finnes eller har noen rariterer i navnet som kan fikses? 😁<br><br>Tilgangsgruppene den ikke fant er:<br><strong>${missingGroups.join('<br>')}</strong>`
        await sendmail({
          to: toArchiveAdministrator,
          subject: 'Arkiveringsroboten fant ikke tilgangsgrupper for personaldokumentasjon :(',
          body: mailStr
        })
        // Sjekk gjennom, kast error om det treng - evt sett til null
        if (!allowNullValues) throw new Error(`Could not find access groups "${missingGroups.join(', ')}" for ${result.enterpriseName}`)
      }

      result.accessGroups = {
        personal: personal ?? null,
        lonn: lonn ?? null
      }
    }
  }
  // Override accessgroups if client wants to
  if (allowNullValues && (!result.accessGroups?.personal || !result.accessGroups?.lonn)) {
    logger('info', ['Parameter "allowNullValues" is set to "true", will continue anyways...'])
    if (!result.accessGroups) result.accessGroups = {}
    if (!result.accessGroups.personal) result.accessGroups.personal = null
    if (!result.accessGroups.lonn) result.accessGroups.lonn = null
  }

  // Then, check if employee project already exists
  const employeeProjectRes = await callTemplateData('employee', 'get-employeeProject', { ssn })

  if (employeeProjectRes.length >= 1 && employeeProjectRes[0].ProjectNumber) {
    // Found at least one project
    if (employeeProjectRes.length > 1) {
      let mailStr = 'Arkiveringsroboten har funnet flere personalprosjekt knyttet til samme ansatt, og trenger at det ryddes i disse for å arkivere automatisk.<br><br><strong>Personalprosjekt:</strong><ul>'
      const projectNumbers = employeeProjectRes.map(prosjekt => {
        mailStr += `<li>${prosjekt.ProjectNumber}</li>`
        return prosjekt.ProjectNumber
      })
      mailStr += `</ul><br>Roboten ønsker seg <strong>${employeeProjectRes[0].ProjectNumber}</strong> som gjeldende personalprosjekt.<br><br>Roboten ordner resten selv når dette er ryddet opp.<br><br>Tusen takk!`
      logger('warn', [`Found several employeeProjects on ssn ${ssn}`, projectNumbers])
      await sendmail({
        to: toArchive7011,
        subject: 'Flere personalprosjekt på en ansatt',
        body: mailStr
      })
    }

    // Enable the next line if you need updating of employeeProject metadata (don't think thats critical)
    // const needsUpdate = (updated || (employeeProjectRes[0].Title !== `Personaldokumentasjon - ${firstName} ${lastName}`) || (employeeProjectRes[0].Contacts[0].Address.StreetAddress !== streetAddress))
    const needsUpdate = false
    if (needsUpdate) { // PrivatePerson was updated, update employeeProject as well
      logger('info', ['syncEmployee', `EmployeeProject "${employeeProjectRes[0].ProjectNumber}" metadata is different from person info (name, ssn, streetAddress), or has wrong project-metadata (title)), will update to match person info and project-metadata`])
      // Templaten under finnes ikke enda... Og du må itj returnere det den gjør
      return await callTemplateData('employee', 'update-employeeProject', { ...personData, projectNumber: employeeProjectRes[0].ProjectNumber })
    } else { // PrivatePerson was not updated, don't need to update elevmappe
      logger('info', ['syncEmployee', `PrivatePerson was not updated, and employee-metadata on project "${employeeProjectRes[0].ProjectNumber}" was correct, no need to update employeeProject, returning data`])
      result.recno = employeeProjectRes[0].Recno
      result.projectNumber = employeeProjectRes[0].ProjectNumber
    }
  } else if (employeeProjectRes.length === 0) {
    // No employee project found - create one
    logger('info', ['syncEmployee', 'No employeeproject found - creating a new one'])
    const createProjectRes = await callTemplateData('employee', 'create-employeeProject', { ...personData, managerEmail: onPremisesUserPrincipalName })
    result.recno = createProjectRes.Recno
    result.projectNumber = createProjectRes.ProjectNumber
  } else {
    logger('error', ['syncEmployee', 'Found employee project - but it did not have a project number, whaaat??'])
    throw new HTTPError(500, 'Found employee project - but it did not have a project number, whaaat??')
  }

  return result
}
