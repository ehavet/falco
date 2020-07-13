import { stripe } from '../libs/stripe'
const config = require('../config')

export interface StripeConfig {
    stripe
    eventHandlerSecret: string
}

export const stripeConfig = {
  stripe: stripe,
  eventHandlerSecret: config.get('FALCO_API_STRIPE_WEBHOOK_SECRET')
}
