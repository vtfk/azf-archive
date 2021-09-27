const callArchive = require('../../call-archive')
const { P360: { vtfkRobotRecno } } = require('../../../config')

module.exports = async options => {
  const payload = {
    service: 'CaseService',
    method: 'CreateCase',
    parameter: {
      CaseType: 'Elev',
      Title: 'Elevmappe',
      UnofficialTitle: `Elevmappe - ${options.firstName} ${options.lastName}`,
      Status: 'B',
      JournalUnit: 'Sentralarkiv',
      SubArchive: '4',
      ArchiveCodes: [
        {
          ArchiveCode: options.ssn,
          ArchiveType: 'FNR',
          Sort: 1,
          IsManualText: true
        },
        {
          ArchiveCode: 'B31',
          ArchiveType: 'FAGKLASSE PRINSIPP',
          Sort: 2,
          IsManualText: true
        }
      ],
      FiledOnPaper: false,
      AccessCode: '13',
      Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
      AccessGroup: 'VTFK Robot',
      ResponsibleEnterpriseRecno: 506,
      ResponsiblePersonRecno: vtfkRobotRecno,
      Contacts: [
        {
          Role: 'Sakspart',
          ReferenceNumber: options.ssn,
          IsUnofficial: true
        }
      ]
    }
  }

  return await callArchive(payload)
}
