const callArchive = require('./call-archive')
const createMetadata = require('./create-metadata')

module.exports = async (system, template, options) => {
  const { archive } = require(`../templates/${system}-${template}.json`)
  const payload = createMetadata({ template: archive, documentData: options })
  if (options.caseNumbers) payload.caseNumbers = options.caseNumbers
  return await callArchive(payload)
}
