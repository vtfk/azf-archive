const { readdirSync } = require('fs')
const HTTPError = require('../lib/http-error')
const createMetadata = require('../lib/create-metadata')

const data = {
  template: {
    ReferenceNumber: '<<<organizationNumber>>>'
  },
  documentData: {
    organizationNumber: '01234',
    school: {
      organizationNumber: '56789'
    }
  }
}

test('Exception thrown when "template" is not defined', () => {
  const fn = () => createMetadata({})
  expect(fn).toThrow(HTTPError)
})

test('Single token is correctly replaced', () => {
  const metadata = createMetadata(data)
  expect(metadata.ReferenceNumber).toBe(data.documentData.organizationNumber)
})

test('Object token is correctly replaced', () => {
  data.template.ReferenceNumber = '<<<school.organizationNumber>>>'
  const metadata = createMetadata(data)
  expect(metadata.ReferenceNumber).toBe(data.documentData.school.organizationNumber)
})

test('Exception thrown when single token doesn\'t exist', () => {
  data.template.ReferenceNumber = '<<<name>>>'
  const fn = () => createMetadata(data)
  expect(fn).toThrow(HTTPError)
})

test('Exception thrown when object token doesn\'t exist', () => {
  data.template.ReferenceNumber = '<<<school.name>>>'
  const fn = () => createMetadata(data)
  expect(fn).toThrow(HTTPError)
})

const templates = readdirSync('./templates')
describe('Test templates', () => {
  test.each(templates)('Expect template %p to have an "archive" property', template => {
    const tp = require(`../templates/${template}`)
    expect(typeof tp.archive).toBe('object')
  })
  test.each(templates)('Expect template %p to have a data equivalent in "test/templates"', template => {
    const data = require(`./templates/${template}`)
    expect(typeof data).toBe('object')
  })
  test.each(templates)('Expect template %p to generate successfully', template => {
    const { archive } = require(`../templates/${template}`)
    const data = require(`./templates/${template}`)
    const metadata = createMetadata({ template: archive, documentData: data })
    expect(typeof metadata).toBe('object')
  })
})
