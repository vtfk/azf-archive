const { readdirSync } = require('fs')
const HTTPError = require('../lib/http-error')
const createMetadata = require('../lib/create-metadata')
const findUnreplaced = require('./lib/find-unreplaced')

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

const templates = readdirSync('./templates') // outside the test working dir is root foler
describe('Test templates', () => {
  test.each(templates)('Expect template %p to have an "archive" property', template => {
    const tp = require(`../templates/${template}`) // inside the test working dir is current folder
    expect(typeof tp.archive).toBe('object')
  })
  test.each(templates)('Expect template %p to have a "data" property', template => {
    const tp = require(`../templates/${template}`) // inside the test working dir is current folder
    expect(typeof tp.data).toBe('object')
  })
  test.each(templates)('Expect template %p to generate successfully', template => {
    const { pdf, archive, data } = require(`../templates/${template}`) // inside the test working dir is current folder
    if (pdf) {
      const pdfMetadata = createMetadata({ template: pdf, documentData: data })
      expect(typeof pdfMetadata).toBe('object')
      expect(findUnreplaced(pdfMetadata).length).toBe(0)
    }
    const archiveMetadata = createMetadata({ template: archive, documentData: data })
    expect(typeof archiveMetadata).toBe('object')
    expect(findUnreplaced(archiveMetadata).length).toBe(0)
  })
})
