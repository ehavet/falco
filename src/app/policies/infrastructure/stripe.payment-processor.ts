import { PaymentProcessor } from '../domain/payment-processor'
import { logger } from '../../../libs/logger'
import { Stripe } from 'stripe'

export class StripePaymentProcessor implements PaymentProcessor {
    #stripe: Stripe

    constructor (stripe) {
      this.#stripe = stripe
    }

    async createIntent (policyId, amount, currency) {
      let paymentIntent
      try {
        paymentIntent = await this.#stripe.paymentIntents.create({
          amount: amount,
          currency: currency,
          metadata: {
            policy_id: policyId
          }
        })
      } catch (error) {
        logger.error(error)
        throw new PaymentIntentFailureError()
      }
      return {
        id: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    }
}

export class PaymentIntentFailureError extends Error {
  constructor () {
    const message: string = 'Stripe invalid request'
    super(message)
    this.name = 'PaymentIntentFailureError'
  }
}
