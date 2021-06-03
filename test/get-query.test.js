const getQuery = require('../lib/get-query')

const explicit = {
  service: 'CaseService',
  method: 'GetCases',
  parameter: {
    ContactReferenceNumber: '01010101010',
    Title: 'Elevmappe'
  },
  options: {
    onlyOpenCases: true
  }
}

const implicit = {
  ContactReferenceNumber: '01010101010',
  Title: 'Elevmappe'
}

test('Parameter are retrieved correctly when explicitly set', () => {
  const query = getQuery(explicit)
  expect(query).toBeTruthy()
  expect(query.parameter).toBeTruthy()
  expect(typeof query.parameter.ContactReferenceNumber).toBe('string')
})

test('Parameter are retrieved correctly when implicitly set', () => {
  const query = getQuery(implicit)
  expect(query).toBeTruthy()
  expect(query.parameter).toBeTruthy()
  expect(typeof query.parameter.ContactReferenceNumber).toBe('string')
})
