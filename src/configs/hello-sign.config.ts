const hellosignSdk = require('hellosign-sdk')
const config = require('../config')

export interface HelloSignConfig {
    hellosign
    clientId: string
    testMode: boolean
}

export const helloSignConfig: HelloSignConfig = {
  hellosign: hellosignSdk({ key: config.get('FALCO_API_HELLO_SIGN_PRIVATE_KEY') }),
  clientId: config.get('FALCO_API_HELLO_SIGN_CLIENT_ID'),
  testMode: config.get('FALCO_API_HELLO_SIGN_TEST_MODE')
}
