module.exports = result => {
  if (!result) throw new Error('Unknown error - Query returned empty')
  if (!result.Successful) {
    console.log(result.ErrorDetails)
    throw new Error(result.ErrorMessage)
  }
  return result
}
