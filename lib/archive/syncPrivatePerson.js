const { logger } = require('@vtfk/logger')
const callTemplateData = require('../call-template-data')
const HTTPError = require('../http-error')

module.exports = async personData => {
  const { ssn, firstName, lastName, streetAddress, zipCode, zipPlace } = personData
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

  const person = {
    ssn,
    firstName,
    lastName,
    streetAddress,
    zipCode,
    zipPlace,
    recno: 0
  }

  // First, check if privateperson already exists
  const privatePersonRes = await callTemplateData('elevmappe', 'get-private-person', personData) // Returns an array of PrivatePerson-objects

  if (privatePersonRes.length === 1 && privatePersonRes[0].PersonalIdNumber) { // Found one privatePerson
    const privatePerson = privatePersonRes[0]
    if (privatePerson.PrivateAddress && privatePerson.PrivateAddress.StreetAddress && (privatePerson.PrivateAddress.StreetAddress.toLowerCase().includes('sperret') || privatePerson.PrivateAddress.StreetAddress.toLowerCase().includes('klient'))) { // blocked address in archive, do not update
      person.recno = privatePerson.Recno
    } else { // Address not blocked in archive, do update
      const updatedPrivatePerson = await callTemplateData('elevmappe', 'update-private-person', personData) // Returns recno of updated privatePerson
      if (!isNaN(updatedPrivatePerson)) {
        person.recno = updatedPrivatePerson
      }
    }
  } else if (privatePersonRes.length === 0) { // No privatePerson found, create one
    const newPrivatePersonRecno = await callTemplateData('elevmappe', 'create-private-person', personData) // Returns recno of created privatePerson
    if (!isNaN(newPrivatePersonRecno)) {
      person.recno = newPrivatePersonRecno
    }
  } else {
    logger('error', ['syncPrivatePerson', `Several privatePersons found on social security number: ${ssn}, send to arkivarer for handling`])
    throw new HTTPError(500, `Several privatePersons found on social security number: ${ssn}, send to arkivarer for handling`)
  }

  return person
}
