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

const dataWithAttachment = {
  template: {
    service: 'DocumentService',
    method: 'CreateDocument',
    parameter: {
      ReferenceNumber: '<<<organizationNumber>>>'
    }
  },
  documentData: {
    organizationNumber: '01234',
    school: {
      organizationNumber: '56789'
    },
    attachments: [{
      title: 'Et vedlegg',
      format: 'docx',
      base64: 'blablabla'
    }]
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

test('Attachment is added to metadata, if attachments parameter is defined', () => {
  const metadata = createMetadata(dataWithAttachment)
  expect(metadata.parameter.Files[0].Title).toBe(dataWithAttachment.documentData.attachments[0].title)
})

test('Exception thrown when attachment is missing required property', () => {
  delete dataWithAttachment.documentData.attachments[0].title
  const fn = () => createMetadata(dataWithAttachment)
  expect(fn).toThrow(HTTPError)
  dataWithAttachment.documentData.attachments[0].title = 'Tittel er tilbake'
})

test('Attachments are added to metadata, if attachments parameter is defined with several files', () => {
  dataWithAttachment.documentData.attachments.push({
    title: 'Vedlegg 2',
    format: 'pdf',
    base64: 'tuuukkkl'
  })
  console.log(dataWithAttachment.documentData.attachments[1])
  const metadata = createMetadata(dataWithAttachment)
  expect(metadata.parameter.Files.length).toBe(2)
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
