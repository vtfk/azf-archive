const settings = require('../local.settings.json')

module.exports = () => {
  process.env = Object.assign(process.env, {
    ...settings.Values
  })
}
