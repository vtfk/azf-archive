const p360 = require('@alheimsins/p360')

function unwrap (contactPersons = {}) {
  const persons = contactPersons.ContactPersons && contactPersons.ContactPersons.ContactPersonResult ? contactPersons.ContactPersons.ContactPersonResult : []
  return persons
}

async function getContactPersons (parameters) {
  const options = {
    baseUrl: process.env.P360_URL,
    username: process.env.P360_USERNAME,
    password: process.env.P360_PASSWORD
  }

  const client = p360(options)
  const contactService = await client.ContactService()

  const query = {
    parameter: { ...parameters }
  }

  const { result: { GetContactPersonsResult } } = await contactService.GetContactPersons(query)
  if (!GetContactPersonsResult || !GetContactPersonsResult.Successful) {
    throw Error(GetContactPersonsResult || 'Unknown error - query failed')
  }
  return unwrap(GetContactPersonsResult, true)
}

module.exports = async function (context, request) {
  if (request.body) {
    try {
      const data = await getContactPersons(request.body)
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
