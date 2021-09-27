const sql = require('mssql')
const { IDM: { user, password, server, database } } = require('../../config')

module.exports = async () => {
  const config = {
    user,
    password,
    server,
    database,
    options: {
      trustServerCertificate: true
    }
  }

  const pool = await sql.connect(config)
  if (!pool) throw new Error('No mssql pool found')

  return pool
}
