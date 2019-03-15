const p360 = require('@alheimsins/p360')
function unwrap (privatePersons = {}) {
  const persons = privatePersons.PrivatePersons && privatePersons.PrivatePersons.PrivatePersonResult ? privatePersons.PrivatePersons.PrivatePersonResult : []
  return persons
}

async function getPrivatePersons (parameters) {
  const options = {
    baseUrl: process.env.P360_URL,
    username: process.env.P360_USERNAME,
    password: process.env.P360_PASSWORD
  }

  const client = p360(options)
  const caseService = await client.ContactService()

  const contactQuery = {
    parameter: { ...parameters }
  }

  const { result: { GetPrivatePersonsResult } } = await caseService.GetPrivatePersons(contactQuery)
  if (!GetPrivatePersonsResult || !GetPrivatePersonsResult.Successful) {
    throw Error('Unknown error - query failed')
  }
  return unwrap(GetPrivatePersonsResult, true)
}

module.exports = async function (context, request) {
  if (request.body) {
    try {
      const data = await getPrivatePersons(request.body)
      context.res = {
        body: data
      }
    } catch (error) {
      context.res = {
        status: 400,
        body: error.message
      }
    }
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a request body'
    }
  }
}
