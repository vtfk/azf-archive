module.exports = {
  PAPERTRAIL: {
    disableLogging: (process.env.PAPERTRAIL_DISABLE_LOGGING && process.env.PAPERTRAIL_DISABLE_LOGGING === 'true') || false,
    host: process.env.PAPERTRAIL_HOST,
    hostname: process.env.PAPERTRAIL_HOSTNAME,
    port: process.env.PAPERTRAIL_PORT
  },
  P360: {
    host: process.env.P360_BASE_URL,
    authkey: process.env.P360_TOKEN,
    robotRecno: process.env.P360_VTFK_ROBOT_RECNO || '200326' // test is: 200336, prod is: 200326 VTFK Robot
  },
  P360_SECURE: {
    host: process.env.P360_SECURE_BASE_URL,
    authkey: process.env.P360_SECURE_TOKEN
  },
  IDM: {
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || '',
    database: process.env.DB_DATABASE || '',
    tableName: process.env.DB_TABLE_NAME || `[${process.env.DB_DATABASE}].[dbo].[${process.env.DB_TABLE}]`
  },
  DSF: {
    jwtSecret: process.env.DSF_JWT_SECRET || false,
    url: process.env.DSF_URL || '',
    saksref: process.env.DSF_SAKSREF || ''
  },
  PDF_GENERATOR: {
    url: process.env.PDF_GENERATOR
  }
}
