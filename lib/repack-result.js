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
    output = output.find(({ Status }) => Status === 'Under behandling')
  }

  return output
}