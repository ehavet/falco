import Stripe from 'stripe'
const config = require('../config')

const stripeConfig = { apiVersion: config.get('FALCO_API_STRIPE_API_VERSION') }

export type StripePartner = {
  demoPartner: Stripe
  partner: Stripe
}
export const stripe: StripePartner = {
  demoPartner: new Stripe(config.get('FALCO_API_STRIPE_API_KEY_TEST'), stripeConfig),
  partner: new Stripe(config.get('FALCO_API_STRIPE_API_KEY'), stripeConfig)
}
