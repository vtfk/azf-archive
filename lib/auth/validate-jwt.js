'use strict'

const jwt = require('jsonwebtoken')

module.exports = options => {
  return new Promise((resolve) => {
    if (!options) {
      throw Error('Missing required input: options')
    }
    if (!options.jwt) {
      throw Error('Missing required input: options.jwt')
    }
    if (!options.tokenKey) {
      throw Error('Missing required input: options.tokenKey')
    }
    jwt.verify(options.jwt, options.tokenKey, (err, decoded) => {
      if (err) {
        throw Error('Given token or data is invalid')
      } else {
        resolve(decoded)
      }
    })
  })
}
