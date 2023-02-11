const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const callTemplateData = require('../call-template-data')
const hasData = require('../has-data')
const { P360: { robotRecno }, MAIL: { toArchive, toArchiveAdministrator }, ACCESSGROUP_EXCEPTIONS } = require('../../config')
const HTTPError = require('../http-error')

module.exports = async (personData, manager, requireAccessGroups) => {
  const { ssn, firstName, lastName, streetAddress, updated, updatedSsn } = personData
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
  if (typeof requireAccessGroups !== 'boolean') {
    logger('error', ['Nokon har kuka med parameter "requireAccessGroups"'])
    throw new HTTPError(500, 'Nokon har kuka med parameter "requireAccessGroups""')
  }

  // First, get manager contact from P360
  const result = {}
  let canContinueAccessGroups = true
  const archiveManagerRes = await callTemplateData('contact', 'get-contact-persons', { email: onPremisesUserPrincipalName })
  if (archiveManagerRes.length === 0) {
    logger('warn', [`Manager ${onPremisesUserPrincipalName} has no user in P360 - cannot continue :(`])
    const mailStr = `Halla!<br><br>Arkiveringsroboten kunne ikke finne 360-bruker for leder "${displayName} - ${onPremisesUserPrincipalName}"<br>Brukeren ${onPremisesUserPrincipalName} jobber i ${department} - ${companyName}.<br><br>Kunne dere ha opprettet bruker for lederen, slik at arkiveringsroboten får arkivert? 😎<br>`
    await sendmail({
      to: toArchiveAdministrator,
      subject: 'Leder mangler bruker i P360',
      body: mailStr
    })
    throw new HTTPError(500, 'Manager does not have P360 user, mail have been sent to archive')
  } else if (archiveManagerRes.length > 1) {
    logger('warn', [`Manager ${onPremisesUserPrincipalName} has several contactpersons on the same email in P360 - cannot continue :(`])
    const mailStr = `Heisann!<br><br>Arkiveringsroboten fant flere kontaktpersoner på leder "${displayName} -${onPremisesUserPrincipalName}".<br>Brukeren ${onPremisesUserPrincipalName} jobber i ${department} - ${companyName}.<br><br>Kunne dere ha ordnet så det kun er en kontaktperson med denne e-postadressen? 🤔`
    await sendmail({
      to: toArchiveAdministrator,
      subject: 'Leder har flere kontaktpersoner i P360',
      body: mailStr
    })
    throw new HTTPError(500, 'Manager have several contactpersons in P360, mail have been sent to archive')
  } else {
    if (!archiveManagerRes[0].Enterprise || archiveManagerRes[0].Enterprise.length < 3) {
      logger('warn', [`Manager ${onPremisesUserPrincipalName} has no connection to any enterprise - cannot continue :(`])
      const mailStr = `Halloisen!<br><br>Arkiveringsroboten fant ikke noe organisasjonsummer på virksomheten der "${displayName} -${onPremisesUserPrincipalName}" er ansatt.<br>${onPremisesUserPrincipalName} jobber i ${department} - ${companyName}.<br><br>Kunne dere ha ordnet organisajonsnummer på virksomheten lederen er ansatt i (i 360)? 😵`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'Intern virksomhet mangler organisasjonsnummer',
        body: mailStr
      })
      if (requireAccessGroups) throw new HTTPError(500, 'Enterprise is missing orgnumber in P360, mail have been sent to archive')
      else canContinueAccessGroups = false
    } else {
      logger('info', [`Found enterprise number ${archiveManagerRes[0].Enterprise} for manager ${onPremisesUserPrincipalName}`])
      result.enterpriseNumber = archiveManagerRes[0].Enterprise
    }
  }

  // Then, get the enterprise from p360
  if (canContinueAccessGroups) {
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
        if (requireAccessGroups) throw new Error(`Could not find access groups "${missingGroups.join(', ')}" for ${result.enterpriseName}`)
      }

      result.accessGroups = {
        personal: personal ?? null,
        lonn: lonn ?? null
      }
    }
  }
  // Override accessgroups if client wants to
  if (!requireAccessGroups && (!result.accessGroups?.personal ?? !result.accessGroups?.lonn)) {
    logger('info', ['Parameter "requireAccessGroups" is set to "false", will continue anyways...'])
    if (!result.accessGroups) result.accessGroups = {}
    if (!result.accessGroups.personal) result.accessGroups.personal = null
    if (!result.accessGroups.lonn) result.accessGroups.lonn = null
  }

  return result
  // Then, check if elevmappe already exists
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

  return result
}
