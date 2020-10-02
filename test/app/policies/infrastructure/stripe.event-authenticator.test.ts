import { expect, sinon } from '../../../test-utils'
import { StripeEventAuthenticator } from '../../../../src/app/policies/infrastructure/stripe.event-authenticator'
import { StripeConfig } from '../../../../src/configs/stripe.config'
import { getStripePaymentIntentSucceededEvent } from '../fixtures/payment/stripeEvent.fixture'
import { UnauthenticatedEventError } from '../../../../src/app/policies/domain/payment-processor.errors'

describe('StripeEventAuthenticator', async () => {
  const stripeConfig: StripeConfig = {
    stripe: { webhooks: { constructEvent: sinon.mock() } },
    eventHandlerSecret: '3v3ntH4ndl13rS3cr3t'
  }

  const eventAuthenticator: StripeEventAuthenticator = new StripeEventAuthenticator(stripeConfig)

  describe('createIntent', async () => {
    it('should return event when event is authenticated', async () => {
      const eventPayload = 'rawPayloadToString'
      const headerSignature = 'rawHeaderSignature'
      const event = getStripePaymentIntentSucceededEvent()

      stripeConfig.stripe.webhooks.constructEvent.withExactArgs(
        eventPayload,
        headerSignature,
        '3v3ntH4ndl13rS3cr3t'
      ).resolves(event)

      const response = await eventAuthenticator.parse(eventPayload, headerSignature)

      expect(response).to.deep.equal(event)
    })

    it('should return UnauthenticatedEventError when event could not be authenticated', async () => {
      const eventPayload = 'rawPayloadToString'
      const wrongHeaderSignature = 'rawHeaderSignature'

      stripeConfig.stripe.webhooks.constructEvent.withExactArgs(
        eventPayload,
        wrongHeaderSignature,
        '3v3ntH4ndl13rS3cr3t'
      ).rejects(new Error())

      await expect(eventAuthenticator.parse(eventPayload, wrongHeaderSignature))
        .to.be.rejectedWith(UnauthenticatedEventError)
    })
  })
})
