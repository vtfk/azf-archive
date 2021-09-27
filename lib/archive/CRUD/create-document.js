const callArchive = require('../../call-archive')
const createMetadata = require('../create-metadata')

module.exports = async options => {
  const { archive: template } = require(`../../../templates/${options.system}-${options.template}.json`)
  template.parameter.Files[0].Base64Data = options.file.data
  const metadata = createMetadata({ template, documentData: options })

  return await callArchive(metadata)
}
