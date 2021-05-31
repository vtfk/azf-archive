const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const getResult = require('../lib/get-result')
const unwrapResult = require('../lib/unwrap-result')
const callService = require('../lib/call-service')

const syncPrivatePerson = async (options) => {
  const service = await getService('ContactService')
  const query = getQuery(options)

  const { result: { SynchronizePrivatePersonResult } } = await service.SynchronizePrivatePerson(query)
  return unwrapResult(getResult(SynchronizePrivatePersonResult))
}

module.exports = async (context, req) => {
  return await callService(req.body, syncPrivatePerson)
}
