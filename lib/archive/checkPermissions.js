const xml2js = require('xml2js')
const vtfkSchools = require('vtfk-schools-info')

const excludeSchools = ['Elev fagskolen', 'Elev skolen for sosiale og medisinske institusjoner', 'Elev Kompetansebyggeren']
const excludeEnterprises = ['Seksjon for pedagogisk psykologisk tjeneste', 'Seksjon for oppfølgingstjeneste']

module.exports = async (doc, newSchool) => {
  let needsChange = false
  if (excludeEnterprises.includes(doc.ResponsibleEnterpriseName)) {
    return false
  }
  const xml = await xml2js.parseStringPromise(doc.DocumentRowPermissions, { explicitArray: false })
  for (const record of xml.RECORDS.RECORD) {
    console.log(record.Permissions)
    if (newSchool.toLowerCase() === record.Grantee.toLowerCase() && record.Permissions.includes('Vis fil')) {
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
