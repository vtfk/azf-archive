module.exports = parameters => {
  return {
    parameter: parameters.parameter ? { ...parameters.parameter } : { ...parameters }
  }
}
