const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const getResult = require('../lib/get-result')
const unwrapResult = require('../lib/unwrap-result')
const callService = require('../lib/call-service')

const createCase = async (options) => {
  const service = await getService('CaseService')
  const query = getQuery(options)

  const { result: { CaseOperationResult } } = await service.CreateCase(query)
  return unwrapResult(getResult(CaseOperationResult))
}

module.exports = async (context, req) => {
  return await callService(req.body, createCase)
}
