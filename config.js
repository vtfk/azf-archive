module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'Noe skikkelig hemmelig',
  PAPERTRAIL: {
    DISABLE_LOGGING: (process.env.PAPERTRAIL_DISABLE_LOGGING && process.env.PAPERTRAIL_DISABLE_LOGGING === 'true') || false,
    HOST: process.env.PAPERTRAIL_HOST,
    HOSTNAME: process.env.PAPERTRAIL_HOSTNAME,
    PORT: process.env.PAPERTRAIL_PORT
  },
  P360: {
    baseUrl: process.env.P360_URL,
    username: process.env.P360_USERNAME,
    password: process.env.P360_PASSWORD
  }
}
