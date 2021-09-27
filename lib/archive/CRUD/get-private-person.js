const callArchive = require('../../call-archive')

module.exports = async options => {
  const payload = {
    service: 'ContactService',
    method: 'GetPrivatePersons',
    parameter: {
      PersonalIdNumber: `${options.ssn}`,
      Active: 'true'
    }
  }

  return await callArchive(payload)
}
