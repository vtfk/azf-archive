const { ConfidentialClientApplication } = require('@azure/msal-node')
const NodeCache = require('node-cache')
const { GRAPH_CLIENT } = require('../config')
const { logger } = require('@vtfk/logger')

const cache = new NodeCache({ stdTTL: 3000 })

module.exports = async (forceNew = false) => {
  const cacheKey = 'graphToken'

  if (!forceNew && cache.get(cacheKey)) {
    logger('info', ['getGraphToken', 'found valid token in cache, will use that instead of fetching new'])
    return (cache.get(cacheKey))
  }

  logger('info', ['getGraphToken', 'no token in cache, fetching new from Microsoft'])
  const config = {
    auth: {
      clientId: GRAPH_CLIENT.clientId,
      authority: `https://login.microsoftonline.com/${GRAPH_CLIENT.tenantId}/`,
      clientSecret: GRAPH_CLIENT.clientSecret
    }
  }

  // Create msal application object
  const cca = new ConfidentialClientApplication(config)
  const clientCredentials = {
    scopes: [GRAPH_CLIENT.scope]
  }

  const token = await cca.acquireTokenByClientCredential(clientCredentials)
  const expires = Math.floor((token.expiresOn.getTime() - new Date()) / 1000)
  logger('info', ['getGraphToken', `Got token from Microsoft, expires in ${expires} seconds.`])
  cache.set(cacheKey, token.accessToken, expires)
  logger('info', ['getGraphToken', 'Token stored in cache'])

  return token.accessToken
}
