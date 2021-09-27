const { logger } = require('@vtfk/logger')
const connect = require('./connect-to-idm')
const { IDM: { tableName } } = require('../../config')

module.exports = async (id) => {
  try {
    const pool = await connect()
    const { recordset } = await pool.request()
      .query(`UPDATE ${tableName} SET Processed = 1, ProcessedDtg = '${new Date().toISOString()}' WHERE IDM_Id = ${id}`)
    pool.close()
    return recordset
  } catch (error) {
    logger('error', ['set-changes', error])
  }
}
