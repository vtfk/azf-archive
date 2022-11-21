const { logger } = require('@vtfk/logger')
const HTTPError = require('./http-error')

function findTokens (key, value, tokenList) {
  if (typeof value === 'string') {
    let reqTok = value.split('<<<')
    reqTok = reqTok.slice(1)
    reqTok = reqTok.map(ele => ele.split('>>>'))
    if (reqTok.length > 0) {
      for (const tok of reqTok) {
        const currentToken = tok[0]
        tokenList.push([key, currentToken])
      }
    }
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      findTokens(`${key}%%%${i}`, value[i], tokenList)
    }
  } else if (typeof value === 'object') {
    for (const [key2, value2] of Object.entries(value)) {
      findTokens(`${key}%%%${key2}`, value2, tokenList)
    }
  }
}

function findObjectValue (token, documentData) {
  const values = token.split('.')
  let value = documentData

  values.forEach(param => {
    value = value[param]
  })

  return value
}

function replaceTokens (p360metadata, tokenList, documentData) { // REMARK: method only supports nested objects of arrays and objects of depth 5
  for (const token of tokenList) {
    const param = token[1]
    let value = ''
    if (param.indexOf('.') > 0) {
      value = findObjectValue(param, documentData)
    } else value = documentData[param]

    let fieldName = token[0].split('%%%')
    fieldName = fieldName.map(ele => (isNaN(ele) ? ele : parseInt(ele))) // need this to access lists in p360metadata object
    if (fieldName.length === 1) {
      p360metadata[fieldName[0]] = p360metadata[fieldName[0]].replace('<<<' + param + '>>>', value)
    }
    if (fieldName.length === 2) {
      p360metadata[fieldName[0]][fieldName[1]] = p360metadata[fieldName[0]][fieldName[1]].replace('<<<' + param + '>>>', value)
    }
    if (fieldName.length === 3) {
      p360metadata[fieldName[0]][fieldName[1]][fieldName[2]] = p360metadata[fieldName[0]][fieldName[1]][fieldName[2]].replace('<<<' + param + '>>>', value)
    }
    if (fieldName.length === 4) {
      p360metadata[fieldName[0]][fieldName[1]][fieldName[2]][fieldName[3]] = p360metadata[fieldName[0]][fieldName[1]][fieldName[2]][fieldName[3]].replace('<<<' + param + '>>>', value)
    }
    if (fieldName.length === 5) {
      p360metadata[fieldName[0]][fieldName[1]][fieldName[2]][fieldName[3]][fieldName[4]] = p360metadata[fieldName[0]][fieldName[1]][fieldName[2]][fieldName[3]][fieldName[4]].replace('<<<' + param + '>>>', value)
    }
  }
}

function verifyData (tokenList, documentData) {
  const error = {
    error: 'Missing required template value(s) in options',
    fields: []
  }

  for (const token of tokenList) {
    const param = token[1]
    if (param.indexOf('.') > 0) {
      const value = findObjectValue(param, documentData)
      if (!value) {
        error.fields.push(param)
      }
    } else if (documentData[param] === undefined) {
      error.fields.push(param)
    }
  }

  if (error.fields.length > 0) {
    logger('error', ['create-metadata', error])
    throw new HTTPError(500, error)
  }
}

function addAttachment (attachment, metadata) {
  const validServices = ['DocumentService']
  const validMethods = ['CreateDocument', 'UpdateDocument']
  if (!validServices.includes(metadata.service)) throw new HTTPError(500, `Adding attachment is only allowed in services: '${validServices.toString()}' this template is using service: '${metadata.service}'. Why are you doing this??`)
  if (!validMethods.includes(metadata.method)) throw new HTTPError(500, `Adding attachment is only allowed in methods: '${validMethods.toString()}' this template is using method: '${metadata.method}'. Why are you doing this??`)
  if (!attachment.title) throw new HTTPError(500, 'Missing required parameter in attachment object "attachment.title"')
  if (!attachment.format) throw new HTTPError(500, 'Missing required parameter in attachment object "attachment.format"')
  if (!attachment.base64) throw new HTTPError(500, 'Missing required parameter in attachment object "attachment.base64"')
  if (!metadata.parameter.Files) metadata.parameter.Files = []
  metadata.parameter.Files.push({
    Base64Data: attachment.base64,
    Format: attachment.format,
    Status: 'F',
    Title: attachment.title,
    VersionFormat: attachment.versionFormat || 'P'
  })
}

function addContact (contact, metadata) {
  const validServices = ['DocumentService', 'CaseService', 'ProjectService']
  const validMethods = ['CreateDocument', 'UpdateDocument', 'CreateCase', 'UpdateCase', 'CreateProject', 'UpdateProject']
  if (!validServices.includes(metadata.service)) throw new HTTPError(500, `Adding contacts is only allowed in services: '${validServices.toString()}' this template is using service: '${metadata.service}'. Why are you doing this?? :(`)
  if (!validMethods.includes(metadata.method)) throw new HTTPError(500, `Adding contacts is only allowed in methods: '${validMethods.toString()}' this template is using method: '${metadata.method}'. Why are you doing this?? :(`)
  if (!contact.ssn && !contact.externalId && !contact.recno) throw new HTTPError(500, 'Missing required parameter in contact object "contact.ssn" or "contact.ExternalId" or "contact.recno')
  if (!contact.role) throw new HTTPError(500, 'Missing required parameter in contact object "contact.role"')
  if (!metadata.parameter.Contacts) metadata.parameter.Contacts = []
  const contactObj = { Role: contact.role }
  if (contact.recno) contactObj.ReferenceNumber = `recno:${contact.recno}`
  else if (contact.ssn) contactObj.ReferenceNumber = contact.ssn
  else if (contact.externalId) contactObj.ExternalId = contact.externalId
  if (contact.isUnofficial) contactObj.IsUnofficial = true
  metadata.parameter.Contacts.push(contactObj)
}

const sanitize = (str) => {
  const sanitized = str.replace(/[<>]/g, '')
  return sanitized
}

module.exports = (options) => {
  if (!options.template) throw new HTTPError(500, 'Missing required parameter "options.template"')

  const p360metadata = JSON.parse(JSON.stringify(options.template)) // creates a new object, based on the schema for this documenttype REMARK: Do not use infinity or functions as values in schema-object!!! They will become null

  const requiredTokens = []
  for (const [key, value] of Object.entries(p360metadata)) {
    findTokens(key, value, requiredTokens)
  }
  verifyData(requiredTokens, options.documentData)
  replaceTokens(p360metadata, requiredTokens, options.documentData)
  if (options.documentData.attachments) {
    for (const attachment of options.documentData.attachments) {
      addAttachment(attachment, p360metadata)
    }
  }
  if (options.documentData.contacts) {
    for (const contact of options.documentData.contacts) {
      addContact(contact, p360metadata)
    }
  }

  // Sanitize some stuff
  if (p360metadata.parameter?.Files) {
    p360metadata.parameter.Files.map(file => {
      file.Title = file.Title.replace(/"/g, "'") // SIF håndterer ikke escaped characters i filnavn - får Illegal character in path, derav denne fiksen
      return file
    })
  }

  if (p360metadata.parameter?.Title) p360metadata.parameter.Title = sanitize(p360metadata.parameter.Title)
  if (p360metadata.parameter?.OfficialTitle) p360metadata.parameter.OfficialTitle = sanitize(p360metadata.parameter.OfficialTitle)
  if (p360metadata.parameter?.UnofficialTitle) p360metadata.parameter.UnofficialTitle = sanitize(p360metadata.parameter.UnofficialTitle)

  return p360metadata
}
