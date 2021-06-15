const limit = method => /(Create)|(Update)|(Synchronize)|(SignOff)|(Delete)|(GetFile)|(Upload)/.exec(method) !== null

module.exports = (options, method) => {
  const opts = options || {}
  if (limit(method)) {
    opts.limit = 1
  }
  return opts
}
