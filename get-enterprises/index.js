const p360 = require('@alheimsins/p360')

function unwrap (enterprises = {}) {
  return enterprises.Enterprises && enterprises.Enterprises.EnterpriseResult ? enterprises.Enterprises.EnterpriseResult : []
}

async function getEnterprises (parameters) {
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

  const { result: { GetEnterprisesResult } } = await contactService.GetEnterprises(query)
  if (!GetEnterprisesResult || !GetEnterprisesResult.Successful) {
    throw Error(GetEnterprisesResult || 'Unknown error - query failed')
  }
  return unwrap(GetEnterprisesResult, true)
}

module.exports = async function (context, request) {
  if (request.body) {
    try {
      const data = await getEnterprises(request.body)
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
