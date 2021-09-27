const { STATUS_CODES } = require('http')

class HTTPError extends Error {
  constructor (code, message, innerError) {
    super(message || STATUS_CODES[code])

    this.name = toName(code)
    this.statusCode = code
    this.message = message
    this.innerError = innerError
  }

  toJSON () {
    const err = {
      statusCode: this.statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        innerError: this.innerError || undefined
      }
    }
    if (typeof this.message === 'object') {
      err.body = { ...this.message, ...err.body }
    } else {
      err.body = { error: this.message, ...err.body }
    }
    return err
  }
}

/**
 * Converts an HTTP status code to an Error `name`.
 * Ex:
 *   302 => "Found"
 *   404 => "NotFoundError"
 *   500 => "InternalServerError"
 */
const toName = (code) => {
  const suffix = (code / 100 | 0) === 4 || (code / 100 | 0) === 5 ? 'Error' : ''
  const statusName = STATUS_CODES[code].replace(/error$/i, '').replace(/ /g, '')
  return `${statusName}${suffix}`
}

module.exports = HTTPError
