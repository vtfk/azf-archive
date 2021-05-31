const HTTPError = require('./http-error')

const unwantedProperties = [
  'ErrorDetails',
  'ErrorMessage',
  'Successful',
  'TotalCount',
  'TotalPageCount'
]

const getNames = result => result == null ? [] : Object.getOwnPropertyNames(result).filter(name => !unwantedProperties.includes(name))
const getResult = result => {
  if (Array.isArray(result)) {
    if (result.length === 0) return {}
    else if (result.length === 1) return result[0]
  }
  
  return result
}
const getOutput = (result, name) => {
  const innerName = getNames(result[name])
  if (innerName.length === 0) throw new HTTPError(404, `'${name}' is undefined`)
  
  return getResult(result[name][innerName])
}

module.exports = (result = {}, options) => {
  const names = getNames(result)
  let output = []
  if (!names || names.length === 0) return output
  else if (names.length === 1) {
    const results = getOutput(result, names)
    if (Array.isArray(results)) {
      output.push(...results)
    } else {
      output.push(results)
    }
  } else if (names.length > 1) {
    names.forEach(name => {
      const results = getOutput(result, name)
      if (Array.isArray(results)) {
        output.push(...results)
      } else {
        output.push(results)
      }
    })
  }

  if (options && options.onlyOpenCases) {
    output = output.find(({ Status }) => Status === 'Under behandling')
  }

  return output
}
