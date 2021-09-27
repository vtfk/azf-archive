const { logger } = require('@vtfk/logger')
const createPrivatePerson = require('./CRUD/create-private-person')
const getPrivatePerson = require('./CRUD/get-private-person')
const updatePrivatePerson = require('./CRUD/update-private-person')
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
  const privatePersonRes = await getPrivatePerson(personData) // Returns an array of PrivatePerson-objects

  if (privatePersonRes.length === 1 && privatePersonRes[0].PersonalIdNumber) { // Found one privatePerson
    const privatePerson = privatePersonRes[0]
    if (privatePerson.PrivateAddress.StreetAddress.toLowerCase().includes('hemmelig')) { // blocked address in archive, do not update
      // Modify this if something changes in how we deal with address block
      person.streetAddress = 'HEMMELIG ADRESSE'
      person.zipCode = '9999'
      person.zipPlace = '_ Ukjent'
      person.recno = privatePerson.Recno
    } else { // Address not blocked in archive, do update
      const updatedPrivatePerson = await updatePrivatePerson(personData) // Returns recno of updated privatePerson
      if (!isNaN(updatedPrivatePerson)) {
        person.recno = updatedPrivatePerson
      }
    }
  } else if (privatePersonRes.length === 0) { // No privatePerson found, create one
    const newPrivatePersonRecno = await createPrivatePerson(personData) // Returns recno of created privatePerson
    if (!isNaN(newPrivatePersonRecno)) {
      person.recno = newPrivatePersonRecno
    }
  } else {
    logger('error', ['syncPrivatePerson', `Several privatePersons found on social security number: ${ssn}, send to arkivarer for handling`])
    throw new HTTPError(500, `Several privatePersons found on social security number: ${ssn}, send to arkivarer for handling`)
  }

  return person
}
