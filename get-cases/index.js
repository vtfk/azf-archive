const p360 = require('@alheimsins/p360')
function unwrap (caseResult, onlyOpenCases) {
  const cases = caseResult.Cases && caseResult.Cases.CaseResult ? caseResult.Cases.CaseResult : []

  if (cases.length === 0) {
    return cases
  } else if (onlyOpenCases && Array.isArray(cases)) {
    return cases.find(({ Status }) => Status === 'Under behandling')
  } else {
    return cases
  }
}

async function getCases (parameters) {
  const options = {
    baseUrl: process.env.P360_URL,
    username: process.env.P360_USERNAME,
    password: process.env.P360_PASSWORD
  }

  const client = p360(options)
  const caseService = await client.CaseService()

  const query = {
    parameter: { ...parameters }
  }

  const { result: { GetCasesResult } } = await caseService.GetCases(query)
  if (!GetCasesResult || !GetCasesResult.Successful) {
    throw Error('Unknown error - query failed')
  }
  return unwrap(GetCasesResult, true)
}

module.exports = async function (context, request) {
  if (request.body) {
    try {
      const data = await getCases(request.body)
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
