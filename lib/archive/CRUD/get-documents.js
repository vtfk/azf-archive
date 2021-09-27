const callArchive = require('../../call-archive')

module.exports = async options => {
  const payload = {
    service: 'DocumentService',
    method: 'GetDocuments',
    secure: true,
    parameter: {
      CaseNumber: options.caseNumber,
      IncludeAccessMatrixRowPermissions: true
    }
  }

  const result = await callArchive(payload)
  if (options.filter && typeof options.filter === 'function') {
    return result.filter(options.filter)
  }
  return result
}
