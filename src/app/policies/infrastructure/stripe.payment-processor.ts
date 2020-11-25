import { Intent, PaymentProcessor } from '../domain/payment-processor'
import { Logger } from '../../../libs/logger'
import { Stripe } from 'stripe'
const config = require('../../../config')

export class StripePaymentProcessor implements PaymentProcessor {
    #stripe: Stripe
    #logger: Logger

    constructor (stripe, logger) {
      this.#stripe = stripe
      this.#logger = logger
    }

    async createIntent (policyId: string, amount: number, currency: string, partnerCode: string): Promise<Intent> {
      let paymentIntent
      const paymentIntentCreateParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency,
        metadata: {
          policy_id: policyId
        }
      }
      try {
        if (partnerCode === 'demo-student') {
          const stripeDemoPartner = new Stripe(config.get('FALCO_API_STRIPE_API_KEY_TEST'), { apiVersion: config.get('FALCO_API_STRIPE_API_VERSION') })

          paymentIntent = await stripeDemoPartner.paymentIntents.create(paymentIntentCreateParams)
        } else {
          paymentIntent = await this.#stripe.paymentIntents.create(paymentIntentCreateParams)
        }
      } catch (error) {
        this.#logger.error(error)
        throw new PaymentIntentFailureError()
      }
      return {
        id: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    }

    async getTransactionFee (rawPaymentIntent: any): Promise<number | null> {
      const stripePaymentIntent = rawPaymentIntent as Stripe.PaymentIntent

      const hasNoCharges: boolean = stripePaymentIntent.charges.data.length === 0
      if (hasNoCharges) {
        this.#logger.error('No charge found for Stripe payment intent', stripePaymentIntent)
        return null
      }

      const hasNoBalanceTransactionId: boolean = stripePaymentIntent.charges.data[0].balance_transaction === null
      if (hasNoBalanceTransactionId) {
        this.#logger.error('No balance transaction id found for Stripe payment intent', stripePaymentIntent)
        return null
      }

      const balanceTransactionId = stripePaymentIntent.charges.data[0].balance_transaction as string

      try {
        const balanceTransaction = await this.#stripe.balanceTransactions.retrieve(balanceTransactionId)
        return balanceTransaction.fee
      } catch (error) {
        this.#logger.error('An error occurred while calling Stripe to retrieve the balance transaction', { error, stripePaymentIntent })
        return null
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
