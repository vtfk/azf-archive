module.exports = {
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
  },
  MAIL: {
    cc: (process.env.MAIL_CC && process.env.MAIL_CC.split(',')) || [],
    bcc: (process.env.MAIL_BCC && process.env.MAIL_BCC.split(',')) || [],
    from: process.env.MAIL_FROM || 'noreply@vtfk.no',
    signature: {
      name: 'Arkiveringsroboten',
      title: '🚣',
      company: 'Vestfold og Telemark fylkeskommune',
      phone: '35 91 70 00',
      mobile: '35 91 70 00'
    },
    secret: process.env.MAIL_SECRET || false,
    toArchive: (process.env.MAIL_TO_ARCHIVE && process.env.MAIL_TO_ARCHIVE.split(',')) || [],
    toArchiveAdministrator: (process.env.MAIL_TO_ARCHIVE_ADMINISTRATOR && process.env.MAIL_TO_ARCHIVE_ADMINISTRATOR.split(',')) || [],
    url: process.env.MAIL_URL
  },
  VIEW_PERMISSION: {
    excludeSchools: ['Elev fagskolen', 'Elev skolen for sosiale og medisinske institusjoner', 'Elev Kompetansebyggeren'],
    excludeEnterprises: ['Seksjon for pedagogisk psykologisk tjeneste', 'Seksjon for oppfølgingstjeneste']
  },
  E18: {
    URL: process.env.E18_URL,
    KEY: process.env.E18_KEY || 'secret secret key'
  }
}
