const callArchive = require('../../call-archive')
const createMetadata = require('../create-metadata')

module.exports = async options => {
  const { archive } = require(`../../pdf/templates/${options.system}-${options.template}.json`)
  archive.parameter.DocumentDate = new Date().toISOString()
  archive.parameter.Files[0].Base64Data = options.file.data
  const metadata = createMetadata({ template: archive, documentData: options })

  return await callArchive(metadata)
}
