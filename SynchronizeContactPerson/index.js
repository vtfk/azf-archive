const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const getResult = require('../lib/get-result')
const unwrapResult = require('../lib/unwrap-result')
const callService = require('../lib/call-service')

const syncContactPerson = async (options) => {
  const service = await getService('ContactService')
  const query = getQuery(options)

  const { result: { SynchronizeContactPersonResult } } = await service.SynchronizeContactPerson(query)
  return unwrapResult(getResult(SynchronizeContactPersonResult))
}

module.exports = async (context, req) => {
  return await callService(req.body, syncContactPerson)
}
