import { expect, sinon } from '../../../test-utils'
import { StripeEventAuthenticator } from '../../../../src/app/policies/infrastructure/stripe.event-authenticator'
import { getStripePaymentIntentSucceededEvent } from '../fixtures/payment/stripeEvent.fixture'
import { UnauthenticatedEventError } from '../../../../src/app/policies/domain/payment-processor.errors'

describe('StripeEventAuthenticator', async () => {
  describe('createPaymentIntent', async () => {
    const stripeConfig = {
      stripe: {
        LiveClient: { webhooks: { constructEvent: sinon.stub() } },
        TestClient: { webhooks: { constructEvent: sinon.stub() } }
      },
      eventHandlerSecret: '3v3ntH4ndl13rS3cr3t'
    } as any
    const eventAuthenticator: StripeEventAuthenticator = new StripeEventAuthenticator(stripeConfig)

    afterEach(() => {
      stripeConfig.stripe.TestClient.webhooks.constructEvent.reset()
      stripeConfig.stripe.LiveClient.webhooks.constructEvent.reset()
    })

    it('should return event when event is authenticated', async () => {
      const eventPayload = '{"fakeJson": "rawPayloadToString"}'
      const headerSignature = 'rawHeaderSignature'
      const event = getStripePaymentIntentSucceededEvent()

      stripeConfig.stripe.LiveClient.webhooks.constructEvent.withArgs(
        eventPayload,
        headerSignature,
        '3v3ntH4ndl13rS3cr3t'
      ).resolves(event)

      const response = await eventAuthenticator.parse(eventPayload, headerSignature)

      expect(response).to.deep.equal(event)
    })

    it('should call the TestClient when the partner is demo-student', async () => {
      const rawEventPayload = '{ "data": { "object": { "metadata": { "partner_code": "demo-student"}}}}'
      const headerSignature = 'rawHeaderSignature'
      const event = getStripePaymentIntentSucceededEvent()

      stripeConfig.stripe.TestClient.webhooks.constructEvent.withArgs(
        rawEventPayload,
        headerSignature,
        '3v3ntH4ndl13rS3cr3t'
      ).resolves(event)

      const response = await eventAuthenticator.parse(rawEventPayload, headerSignature)

      expect(response).to.deep.equal(event)
    })

    it('should return UnauthenticatedEventError when event could not be authenticated', async () => {
      const eventPayload = 'rawPayloadToString'
      const wrongHeaderSignature = 'rawHeaderSignature'

      stripeConfig.stripe.LiveClient.webhooks.constructEvent.withArgs(
        eventPayload,
        wrongHeaderSignature,
        '3v3ntH4ndl13rS3cr3t'
      ).rejects(new Error())

      await expect(eventAuthenticator.parse(eventPayload, wrongHeaderSignature))
        .to.be.rejectedWith(UnauthenticatedEventError)
    })
  })
})
