const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const getResult = require('../lib/get-result')
const unwrapResult = require('../lib/unwrap-result')
const callService = require('../lib/call-service')

const syncUser = async (options) => {
  const service = await getService('UserService')
  const query = getQuery(options)

  const { result: { SynchronizeUserResult } } = await service.SynchronizeUser(query)
  return unwrapResult(getResult(SynchronizeUserResult))
}

module.exports = async (context, req) => {
  return await callService(req.body, syncUser)
}
