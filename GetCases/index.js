const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const getResult = require('../lib/get-result')
const unwrapResult = require('../lib/unwrap-result')
const callService = require('../lib/call-service')

const getCases = async (options) => {
  const service = await getService('CaseService')
  const query = getQuery(options)

  const { result: { GetCasesResult } } = await service.GetCases(query)
  return unwrapResult(getResult(GetCasesResult), {
    onlyOpenCases: options.onlyOpenCases || true
  })
}

module.exports = async (context, req) => {
  return await callService(req.body, getCases)
}
