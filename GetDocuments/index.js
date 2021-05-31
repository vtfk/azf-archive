const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const getResult = require('../lib/get-result')
const unwrapResult = require('../lib/unwrap-result')
const callService = require('../lib/call-service')

const getDocuments = async (options) => {
  const service = await getService('DocumentService')
  const query = getQuery(options)

  const { result: { GetDocumentsResult } } = await service.GetDocuments(query)
  return unwrapResult(getResult(GetDocumentsResult))
}

module.exports = async (context, req) => {
  return await callService(req.body, getDocuments)
}
