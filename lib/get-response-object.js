module.exports = (body, status = 200) => {
  return {
    status,
    headers: {
      'Content-Type': 'application/json'
    },
    body
  }
}
