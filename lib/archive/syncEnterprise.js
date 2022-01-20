const { logger } = require('@vtfk/logger')
const callTemplateData = require('../call-template-data')
const sendmail = require('../send-mail')
const { MAIL: { toArchive } } = require('../../config')
const callArchive = require('../call-archive')

module.exports = async enterprise => {
  const result = {
    ...enterprise,
    recno: 0,
    updated: false
  }
  const enterpriseRes = await callTemplateData('contact', 'get-enterprise', { orgnr: enterprise.EnterpriseNumber })

  if (enterpriseRes.length === 0) {
    const payload = {
      service: 'ContactService',
      method: 'SynchronizeEnterprise',
      parameter: enterprise
    }
    result.recno = await callArchive(payload)
  } else {
    if (enterpriseRes.length > 1) {
      const mailStrBlock = `Arkiveringsroboten har funnet duplikate virksomheter i P360. Kan dere hjelpe meg ved å rydde opp virksomheter med orgnr: ${enterprise.EnterpriseNumber}? Tusen takk :)`
      try {
        await sendmail({
          to: toArchive,
          subject: 'Arkiveringsroboten har funnet duplikate virksomheter i P360',
          body: mailStrBlock
        })
      } catch (error) {
        logger('warn', ['syncEnterprise', `Sending mail failed when trying to alert about duplicate enterprise with enterprisenumber ${enterprise.EnterpriseNumber}`])
      }
    }

    let needsChange = false
    if (enterpriseRes[0].Name.toLowerCase() !== enterprise.Name.toLowerCase()) needsChange = true
    if (enterpriseRes[0].PostAddress?.StreetAddress?.toLowerCase() !== enterprise.PostAddress.StreetAddress.toLowerCase()) needsChange = true
    if (enterpriseRes[0].PostAddress?.ZipCode !== enterprise.PostAddress.ZipCode) needsChange = true
    if (enterpriseRes[0].OfficeAddress?.StreetAddress?.toLowerCase() !== enterprise.OfficeAddress.StreetAddress.toLowerCase()) needsChange = true
    if (enterpriseRes[0].OfficeAddress?.ZipCode !== enterprise.OfficeAddress.ZipCode) needsChange = true

    result.recno = enterpriseRes[0].Recno

    if (needsChange) {
      const payload = {
        service: 'ContactService',
        method: 'UpdateEnterprise',
        parameter: {
          Recno: enterpriseRes[0].Recno,
          ...enterprise
        }
      }
      result.updated = true
      result.recno = await callArchive(payload)
    }
  }
  return result
}
