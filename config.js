module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'Noe skikkelig hemmelig',
  P360: {
    baseUrl: process.env.P360_URL,
    username: process.env.P360_USERNAME,
    password: process.env.P360_PASSWORD
  }
}
