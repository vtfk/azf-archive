const callArchive = require('../../call-archive')
const hasData = require('../../has-data')

module.exports = async options => {
  const payload = {
    service: 'CaseService',
    method: 'GetCases',
    parameter: {
      Title: 'Elevmappe%',
      ContactReferenceNumber: `${options.ssn}`,
      IncludeCaseContacts: true
    }
  }

  const result = await callArchive(payload)
  return result.filter(mappe => hasData(mappe) && mappe.Status !== 'Utgår')
}
