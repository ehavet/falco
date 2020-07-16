const hellosignSdk = require('hellosign-sdk')
const config = require('../config')

export interface HelloSignConfig {
    hellosign
}

export const helloSignConfig: HelloSignConfig = {
  hellosign: hellosignSdk({ key: config.get('FALCO_API_HELLO_SIGN_PRIVATE_KEY') })
}
