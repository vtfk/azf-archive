const xml2js = require('xml2js')
const vtfkSchools = require('vtfk-schools-info')
const { VIEW_PERMISSION } = require('../../config')

const { excludeSchools, excludeEnterprises } = VIEW_PERMISSION

module.exports = async (doc, newSchool) => {
  let needsChange = false
  if (excludeEnterprises.includes(doc.ResponsibleEnterpriseName)) {
    return false
  }
  const xml = await xml2js.parseStringPromise(doc.DocumentRowPermissions, { explicitArray: false })
  const records = Array.isArray(xml.RECORDS.RECORD) ? xml.RECORDS.RECORD : [xml.RECORDS.RECORD]
  for (const record of records) {
    if (newSchool.toLowerCase().trim() === record.Grantee.toLowerCase().trim() && record.Permissions.includes('Vis fil')) {
      return false
    }
    if (record.Permissions.includes('Vis fil') && !excludeSchools.includes(record.Grantee)) {
      const options = {
        accessGroup: record.Grantee
      }
      if (vtfkSchools(options).length === 1) {
        needsChange = true
      }
    }
  }
  return needsChange
}
