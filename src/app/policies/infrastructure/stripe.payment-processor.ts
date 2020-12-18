import { PaymentIntent, PaymentProcessor } from '../domain/payment-processor'
import { Logger } from '../../../libs/logger'
import { Stripe } from 'stripe'
import { StripeClients } from '../../../libs/stripe'
import * as Partner from '../../partners/domain/partner.func'
import { Amount } from '../../common-api/domain/amount/amount'

export class StripePaymentProcessor implements PaymentProcessor {
    #stripe: StripeClients
    #logger: Logger

    constructor (stripe: StripeClients, logger) {
      this.#stripe = stripe
      this.#logger = logger
    }

    async createPaymentIntent (policyId: string, amount: Amount, currency: string, partnerCode: string): Promise<PaymentIntent> {
      let paymentIntent
      const paymentIntentCreateParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency,
        metadata: {
          policy_id: policyId,
          partner_code: partnerCode
        }
      }
      try {
        if (Partner.isRelatedToADemoPartner(partnerCode)) {
          paymentIntent = await this.#stripe.TestClient.paymentIntents.create(paymentIntentCreateParams)
        } else {
          paymentIntent = await this.#stripe.LiveClient.paymentIntents.create(paymentIntentCreateParams)
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

    async getTransactionFee (rawPaymentIntent: any): Promise<Amount | null> {
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
        const balanceTransaction = await this.#stripe.LiveClient.balanceTransactions.retrieve(balanceTransactionId)
        return Amount.convertCentsToEuro(balanceTransaction.fee)
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
