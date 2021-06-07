module.exports = () => {
  process.env = Object.assign(process.env, {
    P360_BASE_URL: 'http://p360server.domain.no:3001',
    P360_TOKEN: 'bla-bla-bla-bla-123',
    P360_SECURE_BASE_URL: 'http://p360sikkerserver.domain.no:3001',
    P360_SECURE_TOKEN: 'bla-bla-bla-bla-123'
  })
}
