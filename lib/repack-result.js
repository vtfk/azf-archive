const { logger } = require('@vtfk/logger')
const hasData = require('./has-data')

const unwantedProperties = [
  'ErrorDetails',
  'ErrorMessage',
  'Successful',
  'TotalCount',
  'TotalPageCount'
]

const getNames = result => result == null ? [] : Object.getOwnPropertyNames(result).filter(name => !unwantedProperties.includes(name))
const getResult = (result, name) => {
  const item = result[name]
  if (Array.isArray(item)) {
    if (item.length === 0) return {}
    else if (item.length === 1) return item[0]
  }

  return item
}

module.exports = (result = {}, options) => {
  if (result.ErrorMessage && result.ErrorMessage !== '\n') {
    logger('error', ['repack-result', result.ErrorMessage])
    const error = (result.ErrorMessage.includes('Exception:')) ? result.ErrorMessage.split('Exception:')[1].split('<operation>')[0] : result.ErrorMessage
    return { error: error.replace(/\\"/g, '').replace(/'/g, '').replace(/"/g, '').replace(/"/g, '`') }
  }

  const names = getNames(result)
  let output = []
  if (!names || names.length === 0) return output
  else if (names.length === 1) {
    const results = getResult(result, names)
    if (Array.isArray(results)) {
      output.push(...results)
    } else {
      output.push(results)
    }
  } else if (names.length > 1) {
    const item = {}
    names.forEach(name => {
      item[name] = getResult(result, name)
    })
    output.push(item)
  }

  if (options && options.onlyOpenCases) {
    output = output.filter(({ Status }) => Status === 'Under behandling') || []
  } else if (options && options.excludeExpiredCases) {
    output = output.filter(({ Status }) => Status !== 'Utgår') || []
  } else if (options && options.limit) {
    if (options.limit === 1 && output.length > 0) return output[0]
    else if (output.length >= options.limit) return output.slice(0, options.limit)
  }

  if (output.length === 1 && !hasData(output[0])) {
    return []
  }

  return output
}
