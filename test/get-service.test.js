require('./lib/mock-envs')()

const services = require('../lib/get-service')
const { P360, P360_SECURE } = require('../config')

const getService = service => {
  const useSecureConnection = Math.random() > 0.5
  return services(service, useSecureConnection)
}

test('GetCases amongst other functions is returned for CaseService', () => {
  const service = getService('CaseService')
  expect(service).toBeTruthy()
  expect(typeof service.GetCases).toBe('function')
})

test('SynchronizeContactPerson amongst other functions is returned for ContactService', () => {
  const service = getService('ContactService')
  expect(service).toBeTruthy()
  expect(typeof service.SynchronizeContactPerson).toBe('function')
})

test('GetDocuments amongst other functions is returned for DocumentService', () => {
  const service = getService('DocumentService')
  expect(service).toBeTruthy()
  expect(typeof service.GetDocuments).toBe('function')
})

test('SynchronizeUser amongst other functions is returned for UserService', () => {
  const service = getService('UserService')
  expect(service).toBeTruthy()
  expect(typeof service.SynchronizeUser).toBe('function')
})

test('Regular P360 connection is returned when secure is not set (undefined)', () => {
  const service = services('UserService')
  expect(service.url).toBe(P360.host)
})

test('Regular P360 connection is returned when secure is set to false', () => {
  const service = services('UserService', false)
  expect(service.url).toBe(P360.host)
})

test('Regular P360 connection is returned when secure is set to an empty String', () => {
  const service = services('UserService', '')
  expect(service.url).toBe(P360.host)
})

test('Regular P360 connection is returned when secure is set to 0', () => {
  const service = services('UserService', 0)
  expect(service.url).toBe(P360.host)
})

test('Secure P360 connection is returned when secure is set to true', () => {
  const service = services('UserService', true)
  expect(service.url).toBe(P360_SECURE.host)
})

test('Secure P360 connection is returned when secure is set to "true"', () => {
  const service = services('UserService', 'true')
  expect(service.url).toBe(P360_SECURE.host)
})

test('Secure P360 connection is returned when secure is set to 1', () => {
  const service = services('UserService', 1)
  expect(service.url).toBe(P360_SECURE.host)
})
