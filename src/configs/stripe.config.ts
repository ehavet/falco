import { stripe, StripeClients } from '../libs/stripe'
const config = require('../config')

export interface StripeConfig {
    stripe: StripeClients
    eventHandlerSecret: string
    eventHandlerSecretTest: string
}

export const stripeConfig = {
  stripe,
  eventHandlerSecret: config.get('FALCO_API_STRIPE_WEBHOOK_SECRET'),
  eventHandlerSecretTest: config.get('FALCO_API_STRIPE_WEBHOOK_SECRET_TEST')
}
