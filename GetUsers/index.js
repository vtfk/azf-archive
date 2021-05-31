const getService = require('../lib/get-service')
const getQuery = require('../lib/get-query')
const getResult = require('../lib/get-result')
const unwrapResult = require('../lib/unwrap-result')
const callService = require('../lib/call-service')

const getUsers = async (options) => {
  const service = await getService('UserService')
  const query = getQuery(options)

  const { result: { GetUsersResult } } = await service.GetUsers(query)
  return unwrapResult(getResult(GetUsersResult))
}

module.exports = async (context, req) => {
  return await callService(req.body, getUsers)
}
