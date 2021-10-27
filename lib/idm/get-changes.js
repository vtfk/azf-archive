const { logger } = require('@vtfk/logger')
const connect = require('./connect-to-idm')
const { IDM: { tableName } } = require('../../config')

module.exports = async () => {
  try {
    const pool = await connect()
    const { recordset } = await pool.request()
      .query(`SELECT * FROM ${tableName} WHERE Processed IS NULL AND IDM_ChangeType <> 'DeleteValue' AND IDM_ChangeType <> 'DeleteObject'`)
    pool.close()
    return recordset
  } catch (error) {
    logger('error', ['get-changes', error])
    return []
  }
}
