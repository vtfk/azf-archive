const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const getResult = require('../lib/get-result')
const unwrapResult = require('../lib/unwrap-result')
const callService = require('../lib/call-service')

const createDocument = async (options) => {
  const service = await getService('DocumentService')
  const query = getQuery(options)

  const { result: { DocumentOperationResult } } = await service.CreateDocument(query)
  return unwrapResult(getResult(DocumentOperationResult))
}

module.exports = async (context, req) => {
  return await callService(req.body, createDocument)
}
