const callArchive = require('../../call-archive')

module.exports = async options => {
  const payload = {
    service: 'ContactService',
    method: 'SynchronizePrivatePerson',
    parameter: {
      FirstName: options.firstName,
      LastName: options.lastName,
      PersonalIdNumber: options.birthnr,
      Active: 'true',
      PrivateAddress: {
        StreetAddress: options.streetAddress,
        ZipCode: options.zipCode,
        ZipPlace: options.zipPlace,
        Country: 'NOR'
      }
    }
  }

  return await callArchive(payload)
}
