const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const getResult = require('../lib/get-result')
const unwrapResult = require('../lib/unwrap-result')
const callService = require('../lib/call-service')

const getPrivatePersons = async (options) => {
  const service = await getService('ContactService')
  const query = getQuery(options)

  const { result: { GetPrivatePersonsResult } } = await service.GetPrivatePersons(query)
  return unwrapResult(getResult(GetPrivatePersonsResult))
}

module.exports = async (context, req) => {
  return await callService(req.body, getPrivatePersons)
}
