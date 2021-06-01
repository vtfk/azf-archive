module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'Noe skikkelig hemmelig',
  PAPERTRAIL: {
    DISABLE_LOGGING: (process.env.PAPERTRAIL_DISABLE_LOGGING && process.env.PAPERTRAIL_DISABLE_LOGGING === 'true') || false,
    HOST: process.env.PAPERTRAIL_HOST,
    HOSTNAME: process.env.PAPERTRAIL_HOSTNAME,
    PORT: process.env.PAPERTRAIL_PORT
  },
  P360: {
    host: process.env.P360_BASE_URL,
    authkey: process.env.P360_TOKEN
  },
  P360_SECURE: {
    host: process.env.P360_SECURE_BASE_URL,
    authkey: process.env.P360_SECURE_TOKEN
  }
}
