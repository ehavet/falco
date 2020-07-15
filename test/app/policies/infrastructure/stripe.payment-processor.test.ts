import { expect, sinon } from '../../../test-utils'
import { StripePaymentProcessor } from '../../../../src/app/policies/infrastructure/stripe.payment-processor'

describe('StripePaymentProcessor', async () => {
  const stripeMock = { paymentIntents: { create: sinon.mock() } }
  const paymentProcessor: StripePaymentProcessor = new StripePaymentProcessor(stripeMock)

  describe('createIntent', async () => {
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
})
