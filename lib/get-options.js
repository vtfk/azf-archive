const limitToOne = method => /(Create)|(Update)|(Synchronize)|(SignOff)|(Delete)|(GetFile)|(Upload)/.exec(method) !== null

module.exports = (options, method) => {
  const opt = options | {}
  if (limitToOne(method)) {
    opt.limit = 1
  }
  return options
}
