const unreplaced = []

const findString = data => {
  if (data.indexOf('<<<') > -1 || data.indexOf('>>>') > -1) {
    unreplaced.push(data)
  }
}

const findInObject = (data) => {
  Object.getOwnPropertyNames(data).forEach(k => {
    if (typeof data[k] === 'object' && data[k] !== null) findInObject(data[k])
    else if (Array.isArray(data[k])) findInArray(data[k])
    else if (typeof data[k] === 'string') findString(data[k])
  })
}

const findInArray = (data) => {
  data.forEach(k => {
    if (typeof k === 'string') findString(k)
  })
}

module.exports = (data, options) => {
  if (typeof data === 'object' && data !== null && data !== undefined) findInObject(data)
  else if (Array.isArray(data)) findInArray(data)
  else if (typeof data === 'string') findString(data)

  return unreplaced
}
