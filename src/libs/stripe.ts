import Stripe from 'stripe'
const config = require('../config')

export const stripe = new Stripe(config.get('FALCO_API_STRIPE_PRIVATE_KEY'), { apiVersion: '2020-03-02' })
