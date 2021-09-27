const callArchive = require('../../call-archive')

module.exports = async options => {
  const payload = {
    service: 'CaseService',
    method: 'UpdateCase',
    parameter: {
      CaseNumber: options.caseNumber,
      Contacts: [
        {
          Role: 'Sakspart',
          ReferenceNumber: options.birthnr,
          IsUnofficial: true
        }
      ],
      SyncCaseContacts: true
    }
  }

  return await callArchive(payload)
}
