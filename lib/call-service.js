const HTTPError = require('./http-error')

module.exports = async (req, next) => {
  if (!req) {
    return {
      status: 400,
      body: {
        error: 'Please pass a request body'
      }
    }
  }

  try {
    const data = await next(req)
    return {
      body: data
    }
  } catch (error) {
    if (error instanceof HTTPError) return error.toJSON()

    return {
      status: 400,
      body: {
        error: error.message
      }
    }
  }
}
