import Stripe from 'stripe'
const config = require('../config')

export const stripe = new Stripe(config.get('FALCO_API_STRIPE_API_KEY'), { apiVersion: config.get('FALCO_API_STRIPE_API_VERSION') })
