import { expect, sinon } from '../../../test-utils'
import { StripePaymentProcessor } from '../../../../src/app/policies/infrastructure/stripe.payment-processor'
import { getStripePaymentIntentSucceededEvent } from '../fixtures/payment/stripeEvent.fixture'
import { Stripe } from 'stripe'

describe('Payment - Infra - Stripe Payment Processor', async () => {
  const stripeMock = {
    paymentIntents: { create: sinon.mock() },
    balanceTransactions: { retrieve: sinon.mock() }
  }
  const loggerMock = { error: sinon.stub() }

  const paymentProcessor: StripePaymentProcessor = new StripePaymentProcessor(stripeMock, loggerMock)

  describe('#createIntent', async () => {
    it('should create a payment intent and return a client secret', async () => {
      const mockedStripeResponse = {
        client_secret: 'pi_1nt3Nt1d',
        anotherkey: null,
        otherKey: 'fake',
        amount: 5000,
        currency: 'eur'
      }
      stripeMock.paymentIntents.create.withExactArgs({
        amount: 5000,
        currency: 'eur',
        metadata: {
          policy_id: 'APP463109486'
        }
      }).resolves(mockedStripeResponse)
      const response = await paymentProcessor.createIntent('APP463109486', 5000, 'eur')
      expect(response).to.deep.equal({
        id: 'pi_1nt3Nt1d',
        amount: 5000,
        currency: 'eur'
      })
    })
  })

  describe('#getTransactionFee', async () => {
    it('should return the fee related to the given payment intent', async () => {
      // Given
      const rawPaymentIntent = getStripePaymentIntentSucceededEvent().data.object as Stripe.PaymentIntent

      const balanceTransactionId = rawPaymentIntent.charges.data[0].balance_transaction
      const balanceTransaction: Stripe.BalanceTransaction = {
        amount: 0,
        available_on: 0,
        created: 0,
        currency: '',
        description: null,
        exchange_rate: null,
        fee: 230,
        fee_details: [],
        id: '',
        net: 0,
        object: 'balance_transaction',
        reporting_category: '',
        source: null,
        status: '',
        type: 'payment'
      }
      stripeMock.balanceTransactions.retrieve.withArgs(balanceTransactionId).resolves(balanceTransaction)

      // When
      const pspFee = await paymentProcessor.getTransactionFee(rawPaymentIntent)

      // Then
      expect(pspFee).to.equal(balanceTransaction.fee)
    })

    it('should return null if there is no charge related to the given payment intent', async () => {
      // Given
      const rawPaymentIntent = getStripePaymentIntentSucceededEvent(
        {
          data: { object: { charges: { data: [] } } }
        }
      ).data.object as Stripe.PaymentIntent

      // When
      const pspFee = await paymentProcessor.getTransactionFee(rawPaymentIntent)

      // Then
      expect(pspFee).to.be.null
    })

    it('should return null if the balance transaction id is null', async () => {
      // Given
      const rawPaymentIntent = getStripePaymentIntentSucceededEvent(
        {
          data: { object: { charges: { data: [{ balance_transaction: null }] } } }
        }
      ).data.object as Stripe.PaymentIntent

      // When
      const pspFee = await paymentProcessor.getTransactionFee(rawPaymentIntent)

      // Then
      expect(pspFee).to.be.null
    })

    it('should return null if there is an error while calling Stripe', async () => {
      // Given
      const rawPaymentIntent = getStripePaymentIntentSucceededEvent().data.object as Stripe.PaymentIntent
      const balanceTransactionId = rawPaymentIntent.charges.data[0].balance_transaction

      stripeMock.balanceTransactions.retrieve.withArgs(balanceTransactionId).rejects(Error)

      // When
      const pspFee = await paymentProcessor.getTransactionFee(rawPaymentIntent)

      // Then
      expect(pspFee).to.be.null
    })
  })
})
