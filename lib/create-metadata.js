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
    message: 'Missing required template value(s) in options',
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

module.exports = (options) => {
  if (!options.template) throw new HTTPError(500, 'Missing required parameter "options.template"')

  const p360metadata = JSON.parse(JSON.stringify(options.template)) // creates a new object, based on the schema for this documenttype REMARK: Do not use infinity or functions as values in schema-object!!! They will become null

  const requiredTokens = []
  for (const [key, value] of Object.entries(p360metadata)) {
    findTokens(key, value, requiredTokens)
  }
  verifyData(requiredTokens, options.documentData)
  replaceTokens(p360metadata, requiredTokens, options.documentData)
  return p360metadata
}
