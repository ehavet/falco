import { PaymentProcessor } from '../domain/payment-processor'
import { logger } from '../../../libs/logger'

export class StripePaymentProcessor implements PaymentProcessor {
    stripe
    constructor (
      stripe
    ) {
      this.stripe = stripe
    }

    async createIntent (amount, currency) {
      let paymentIntent
      try {
        paymentIntent = await this.stripe.paymentIntents.create({
          amount: amount,
          currency: currency
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
