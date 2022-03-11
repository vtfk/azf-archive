const { logger } = require('@vtfk/logger')
const callTemplateData = require('../call-template-data')
const sendmail = require('../send-mail')
const { MAIL: { toArchiveAdministrator } } = require('../../config')
const HTTPError = require('../http-error')

const comparePrivatePersonToDsf = (dsfPerson, privatePerson) => {
  if (!privatePerson.PrivateAddress) return false
  if (dsfPerson.streetAddress.toLowerCase() !== privatePerson.PrivateAddress.StreetAddress.toLowerCase()) return false
  if (dsfPerson.zipCode !== privatePerson.PrivateAddress.ZipCode) return false
  if (dsfPerson.zipPlace !== privatePerson.PrivateAddress.ZipPlace) return false
  if (dsfPerson.firstName !== privatePerson.FirstName) return false
  if (dsfPerson.lastName !== privatePerson.LastName) return false
  return true
}

module.exports = async personData => {
  const { ssn, oldSsn, firstName, lastName, streetAddress, zipCode, zipPlace, addressCode } = personData
  if (!ssn) {
    logger('error', ['Missing required parameter "personData.ssn"'])
    throw new HTTPError(400, 'Missing required parameter "personData.ssn"')
  }
  if (!oldSsn) {
    logger('error', ['Could not find oldSsn variable, something is wrong in the code, oh-oh'])
    throw new HTTPError(500, 'Could not find oldSsn variable, something is wrong in the code, oh-oh')
  }
  if (!firstName) {
    logger('error', ['Missing required parameter "personData.firstName"'])
    throw new HTTPError(400, 'Missing required parameter "personData.firstName"')
  }
  if (!lastName) {
    logger('error', ['Missing required parameter "personData.lastName"'])
    throw new HTTPError(400, 'Missing required parameter "personData.lastName"')
  }
  if (!streetAddress) {
    logger('error', ['Missing required parameter "personData.streetAddress"'])
    throw new HTTPError(400, 'Missing required parameter "personData.streetAddress"')
  }
  if (!zipCode) {
    logger('error', ['Missing required parameter "personData.zipCode"'])
    throw new HTTPError(400, 'Missing required parameter "personData.zipCode"')
  }
  if (!zipPlace) {
    logger('error', ['Missing required parameter "personData.zipPlace"'])
    throw new HTTPError(400, 'Missing required parameter "personData.zipPlace"')
  }
  if (typeof addressCode !== 'number') {
    logger('error', ['Missing required parameter "personData.addressCode"'])
    throw new HTTPError(400, 'Missing required parameter "personData.addressCode"')
  }

  const person = {
    ssn,
    oldSsn,
    firstName,
    lastName,
    streetAddress,
    zipCode,
    zipPlace,
    addressCode,
    recno: 0,
    updated: false,
    updatedSsn: false
  }

  // Egen håndtering om det er adressesperring
  const addressBlockCodes = [4, 6, 7]
  if (addressBlockCodes.includes(addressCode)) {
    // Hvis ikke eksisterer på nytt fnr, lag ny, send mail. Hvis eksisterer på nyeste fnr, itj oppdater - send videre i retur - kan hende skal gis beskjed om man endrer på saker
    const privatePersonRes = await callTemplateData('elevmappe', 'get-private-person', { ssn })
    if (privatePersonRes.length === 1 && privatePersonRes[0].PersonalIdNumber) {
      if (privatePersonRes[0].PrivateAddress && privatePersonRes[0].PrivateAddress.StreetAddress && !(privatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('sperret'))) {
        const updatedPrivatePerson = await callTemplateData('elevmappe', 'update-private-person', { ...personData, recno: privatePersonRes[0].Recno }) // Returns recno of updated privatePerson
        if (Number(updatedPrivatePerson)) {
          person.recno = updatedPrivatePerson
          person.updated = true
        }
        // Send mail til 360 administrator om at dette er en adressesperring, som manglet dette i 360
        const mailStrBlock = `Arkiveringsroboten fant en person med adressesperring som ikke var registrert med adressesperre i Public 360.<br>Roboten har oppdatert privatpersonen slik at adressen ikke synes, men adressesperrekontakt må vurdere om det heller skal deaktiveres og lages en ny privatperson.<br><br>Privatperson det gjelder har <strong>Recno: ${privatePersonRes[0].Recno}</strong>`
        await sendmail({
          to: toArchiveAdministrator,
          subject: 'VIKTIG: Oppdaget adressesperre!',
          body: mailStrBlock
        })
        logger('info', ['syncPrivatePerson', `Found address block in DSF but not in P360, updated privatePerson with "Recno: ${privatePersonRes[0].Recno}" and sent mail to address block-contact`])
      } else {
        // Trenger ikke oppdatere - har allerede sperret adresse
        logger('info', ['syncPrivatePerson', `Found address block both in DSF and P360, will not update privatePerson with "Recno: ${privatePersonRes[0].Recno}"`])
        person.recno = privatePersonRes[0].Recno
      }
    } else if (privatePersonRes.length === 0) {
      const newPrivatePersonRecno = await callTemplateData('elevmappe', 'create-private-person', personData) // Returns recno of created privatePerson
      if (Number(newPrivatePersonRecno)) {
        person.recno = newPrivatePersonRecno
      }
      // Send mail til 360 administrator om at det er opprettet privatperson med adressesperre
      const mailStrBlock = `Arkiveringsroboten har opprettet en ny privatperson med adressesperring i Public 360.<br><br>Privatperson det gjelder har <strong>Recno: ${newPrivatePersonRecno}</strong>`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'VIKTIG: Opprettet privatperson med adressesperre!',
        body: mailStrBlock
      })
      logger('info', ['syncPrivatePerson', `Found address block in DSF but no existing privatePerson in P360. Created PrivatePerson with "Recno: ${person.recno}" and sent mail to address block-contact`])
    } else {
      // Send mail til 360 administrator om at det er funnet flere privatpersoner med samme fnr og adressesperre i p360
      logger('error', ['syncPrivatePerson', `Several privatePersons found on social security number: ${ssn}, send to arkiv-administrator for handling`])
      throw new HTTPError(500, `Several privatePersons found on social security number: ${ssn}, send to arkiv-administrator for handling`)
    }
    return person
  }
  // Ferdig med adressesperre håndtering

  const flow = {
    oldPrivatePersonRes: false,
    privatePersonRes: false,
    hasOldPrivatePerson: false,
    hasPrivatePerson: false,
    oldHasP360AddressBlock: false,
    hasP360AddressBlock: false
  }

  // Hvis nytt fnr - sjekk om det finnes privatperson på det gamle og det nye - hvis begge eksisterer, send mail til arkiv om at det må ryddes. Hvis det bare eksisterer privatperson på det gamle, oppdater denne med nytt fnr. Hvis det ikke eksisterer noen, opprett ny privatperson med det nye fnr. Hvis det bare eksisterer på det nye - wtf?? Gjør som vanlig tipper jeg (Kan bekrefte nå i ettertid at "gjør som vanlig" stemmer).
  flow.privatePersonRes = await callTemplateData('elevmappe', 'get-private-person', { ssn })
  if (flow.privatePersonRes.length === 1 && flow.privatePersonRes[0].PersonalIdNumber) {
    flow.hasPrivatePerson = true
    if (flow.privatePersonRes[0].PrivateAddress && flow.privatePersonRes[0].PrivateAddress.StreetAddress && (flow.privatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('sperret') || flow.privatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('klient'))) flow.hasP360AddressBlock = true
  } else if (flow.privatePersonRes.length > 1) {
    logger('error', ['syncPrivatePerson', `Several privatePersons found on social security number: ${ssn}, send to arkivarer for handling`])
    throw new HTTPError(500, `Several privatePersons found on social security number: ${ssn}, send to arkivarer for handling`)
  }
  if (ssn !== oldSsn) {
    flow.oldPrivatePersonRes = await callTemplateData('elevmappe', 'get-private-person', { ssn: oldSsn })
    if (flow.oldPrivatePersonRes.length === 1 && flow.oldPrivatePersonRes[0].PersonalIdNumber) {
      flow.hasOldPrivatePerson = true
      if (flow.oldPrivatePersonRes[0].PrivateAddress && flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress && (flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('sperret') || flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('klient'))) flow.oldHasP360AddressBlock = true
    } else if (flow.oldPrivatePersonRes.length > 1) {
      logger('error', ['syncPrivatePerson', `Several privatePersons found on old social security number: ${oldSsn}, send tre arkivarer på handletur`])
      throw new HTTPError(500, `Several privatePersons found on old social security number: ${oldSsn}, send to arkivarer for handling`)
    }
  }
  if (!flow.hasOldPrivatePerson && !flow.hasPrivatePerson) { // Har ingen privatperson i P360, hverken på gammelt eller nytt fnr
    // Create privateperson
    const newPrivatePersonRecno = await callTemplateData('elevmappe', 'create-private-person', personData) // Returns recno of created privatePerson
    if (!isNaN(newPrivatePersonRecno)) {
      person.recno = newPrivatePersonRecno
    }
  } else if (flow.hasOldPrivatePerson && !flow.hasPrivatePerson) { // Har privatperson i P360 på gammelt fnr, oppdaterer denne privatpersonen med nytt fnr
    // Update old privateperson with new ssn
    if (flow.oldHasP360AddressBlock) { // Special case, new fnr, no address block in DSF, but address block in P360
      const specialCaseData = {
        recno: flow.oldPrivatePersonRes[0].Recno,
        firstName,
        lastName,
        ssn,
        streetAddress: flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress,
        zipCode: flow.oldPrivatePersonRes[0].PrivateAddress.ZipCode,
        zipPlace: flow.oldPrivatePersonRes[0].PrivateAddress.ZipPlace
      }
      // Skreller vekk reell adresse fra person i tillegg
      person.streetAddress = flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress
      person.zipCode = flow.oldPrivatePersonRes[0].PrivateAddress.ZipCode
      person.zipPlace = flow.oldPrivatePersonRes[0].PrivateAddress.ZipPlace
      const updatedPrivatePerson = await callTemplateData('elevmappe', 'update-private-person', specialCaseData) // Returns recno of updated privatePerson
      if (!isNaN(updatedPrivatePerson)) {
        person.recno = updatedPrivatePerson
        person.updated = true
        person.updatedSsn = true
      }
      // Send mail til 360 administrator om at det er oppdatert en kontakt som har adressesperring i 360 men ikke i DSF. Har kun oppdatert fødselsnummer på kontakten, men de bør sjekke opp om personen skal ha adressesperre eller ikke - sjekke at alt er på stell
      const mailStrBlock = `Arkiveringsroboten har oppdatert fødselsnummer på en privatperson med adressesperring i Public 360, men som ikke har adressesperre i Infotorg.<br><br>Privatperson det gjelder har <strong>Recno: ${updatedPrivatePerson}</strong><br><br>Det bør undersøkes om personen skal ha adressesperre i Public 360 eller ikke.`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'VIKTIG: Privatperson med adressesperre i 360, men ikke i Infotorg',
        body: mailStrBlock
      })
      logger('info', ['syncPrivatePerson', `Found address block on privatePerson in P360, but not in DSF. Updated only ssn on PrivatePerson with "Recno: ${person.recno}" and sent mail to address block-contact`])
    } else {
      const updatedPrivatePerson = await callTemplateData('elevmappe', 'update-private-person', { ...personData, recno: flow.oldPrivatePersonRes[0].Recno }) // Returns recno of updated privatePerson
      if (!isNaN(updatedPrivatePerson)) {
        person.recno = updatedPrivatePerson
        person.updated = true
        person.updatedSsn = true
      }
    }
  } else if (!flow.hasOldPrivatePerson && flow.hasPrivatePerson) { // Har enten ikke nytt fnr, eller har kun en privatperson på det nye fnr, trenger bare en oppdatering av privatperson
    if (flow.hasP360AddressBlock) { // Special case, no address block in DSF, but address block in P360
      // Skreller vekk reell adresse fra person
      person.streetAddress = flow.privatePersonRes[0].PrivateAddress.StreetAddress
      person.zipCode = flow.privatePersonRes[0].PrivateAddress.ZipCode
      person.zipPlace = flow.privatePersonRes[0].PrivateAddress.ZipPlace
      person.recno = flow.privatePersonRes[0].Recno
      // Send mail til 360 administrator om at det er funnet en kontakt som har adressesperring i 360 men ikke i DSF. Har ikke oppdatert noe på kontakten, men de bør sjekke opp om personen skal ha adressesperre eller ikke - sjekke at alt er på stell
      const mailStrBlock = `Arkiveringsroboten har funnet en privatperson med adressesperring i Public 360, men som ikke har adressesperre i Infotorg.<br><br>Privatperson det gjelder har <strong>Recno: ${flow.privatePersonRes[0].Recno}</strong><br><br>Det bør undersøkes om personen skal ha adressesperre i Public 360 eller ikke.`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'VIKTIG: Privatperson med adressesperre i 360, men ikke i Infotorg',
        body: mailStrBlock
      })
      logger('info', ['syncPrivatePerson', `Found address block on privatePerson in P360, but not in DSF. Did not update PrivatePerson with "Recno: ${person.recno}", but sent mail to address block-contact`])
    } else {
      if (!comparePrivatePersonToDsf(personData, flow.privatePersonRes[0])) {
        const updatedPrivatePerson = await callTemplateData('elevmappe', 'update-private-person', { ...personData, recno: flow.privatePersonRes[0].Recno }) // Returns recno of updated privatePerson
        if (!isNaN(updatedPrivatePerson)) {
          person.recno = updatedPrivatePerson
          person.updated = true
        }
      } else {
        logger('info', ['syncPrivatePerson', 'Found privatePerson, but there was no difference between DSF person and P360 PrivatePerson. No need to update :)'])
        person.recno = flow.privatePersonRes[0].Recno
      }
    }
  } else {
    // Fant privatperson på både gammelt og nytt fnr... Her må det ryddes
    const mailStrBlock = `Arkiveringsroboten har funnet to privatpersoner i Public 360, men det er egentlig bare en privatperson som har byttet fødselsnummer. Roboten trenger hjelp til å rydde opp i dette, for den vet ikke hvordan :(<br> Dokumenter og saker der privatpersonene er sakspart bør sikkert også sjekkes.<br><br>Personene det gjelder er <strong>Recno: ${flow.privatePersonRes[0].Recno}</strong> (nytt fnr) og <strong>Recno: ${flow.oldPrivatePersonRes[0].Recno}</strong> (gammelt fnr)`
    await sendmail({
      to: toArchiveAdministrator,
      subject: 'Funnet to privatpersoner etter fødselsnummerbytte',
      body: mailStrBlock
    })
    logger('error', ['syncPrivatePerson', `Found privatePerson on both found old social security number: ${oldSsn}, and new social security number: ${ssn}, send to arkivarer for handling`])
  }

  return person
}
