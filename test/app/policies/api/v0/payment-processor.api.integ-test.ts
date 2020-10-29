import { expect, HttpServerForTesting, newMinimalServer, sinon } from '../../../../test-utils'
import { container, policiesRoutes } from '../../../../../src/app/policies/policies.container'
import { PolicyNotFoundError } from '../../../../../src/app/policies/domain/policies.errors'
import * as supertest from 'supertest'
import { getStripePaymentIntentSucceededEvent } from '../../fixtures/payment/stripeEvent.fixture'
import { UnauthenticatedEventError } from '../../../../../src/app/policies/domain/payment-processor.errors'
import { Stripe } from 'stripe'
import { createConfirmPaymentIntentCommandFixture } from '../../fixtures/payment/confirmPaymentIntentCommand.fixture'

describe('Payment Intent Event Handler - API - Integration', async () => {
  let httpServer: HttpServerForTesting

  describe('POST /internal/v0/payment-processor/event-handler/', async () => {
    let response: supertest.Response

    before(async () => {
      httpServer = await newMinimalServer(policiesRoutes())
    })

    describe('when success', () => {
      it('should reply with status 204', async () => {
        const stripeHeaderSignature = 'srt1p3s1gN4tUR3'
        const policyId = 'APP463109486'
        const event = getStripePaymentIntentSucceededEvent(
          { data: { object: { metadata: { policy_id: policyId } } } })

        sinon.stub(container.PaymentEventAuthenticator, 'parse')
          .withArgs(JSON.stringify(event), stripeHeaderSignature).resolves(event)

        sinon.stub(container, 'ConfirmPaymentIntentForPolicy')
          .withArgs(policyId).resolves(undefined)

        response = await httpServer.api()
          .post('/internal/v0/payment-processor/event-handler/')
          .set('stripe-signature', stripeHeaderSignature)
          .send(event)

        expect(response).to.have.property('statusCode', 204)
      })
    })

    describe('when policy is not found', () => {
      it('should reply with status 404', async () => {
        const stripeHeaderSignature = 'srt1p3s1gN4tUR3'
        const policyId = 'APP463109486'
        const event = getStripePaymentIntentSucceededEvent(
          { data: { object: { metadata: { policy_id: policyId } } } })

        sinon.stub(container.PaymentEventAuthenticator, 'parse')
          .withArgs(JSON.stringify(event), stripeHeaderSignature).resolves(event)

        const stripePaymentIntent = event.data.object as Stripe.PaymentIntent
        const expectedCommand = createConfirmPaymentIntentCommandFixture({
          policyId,
          amount: stripePaymentIntent.amount,
          externalId: stripePaymentIntent.id,
          rawPaymentIntent: stripePaymentIntent
        })

        sinon.stub(container, 'ConfirmPaymentIntentForPolicy')
          .withArgs(expectedCommand)
          .rejects(new PolicyNotFoundError(policyId))

        response = await httpServer.api()
          .post('/internal/v0/payment-processor/event-handler/')
          .set('stripe-signature', stripeHeaderSignature)
          .send(event)

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${policyId}`)
      })
    })

    describe('when event is not valid', () => {
      it('should reply with status 403 when event is unauthorized', async () => {
        const stripeHeaderSignature = 'srt1p3s1gN4tUR3'
        const unauthorizedEvent = getStripePaymentIntentSucceededEvent(
          { type: 'unrecognized.event' })

        sinon.stub(container.PaymentEventAuthenticator, 'parse')
          .withArgs(JSON.stringify(unauthorizedEvent), stripeHeaderSignature).resolves(unauthorizedEvent)

        response = await httpServer.api()
          .post('/internal/v0/payment-processor/event-handler/')
          .set('stripe-signature', stripeHeaderSignature)
          .send(unauthorizedEvent)

        expect(response).to.have.property('statusCode', 403)
      })

      it('should reply with status 403 when event is unauthenticated', async () => {
        const corruptedEvent = getStripePaymentIntentSucceededEvent({ object: 'event' })
        const stripeHeaderSignature = 'srt1p3s1gN4tUR3'

        sinon.stub(container.PaymentEventAuthenticator, 'parse')
          .withArgs(JSON.stringify(corruptedEvent), stripeHeaderSignature).rejects(new UnauthenticatedEventError('UnauthenticatedEvent'))

        response = await httpServer.api()
          .post('/internal/v0/payment-processor/event-handler/')
          .set('stripe-signature', stripeHeaderSignature)
          .send(corruptedEvent)

        expect(response).to.have.property('statusCode', 403)
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500', async () => {
        const event = getStripePaymentIntentSucceededEvent()
        const stripeHeaderSignature = 'srt1p3s1gN4tUR3'

        sinon.stub(container.PaymentEventAuthenticator, 'parse')
          .withArgs(JSON.stringify(event), stripeHeaderSignature).resolves(event)

        const stripePaymentIntent = event.data.object as Stripe.PaymentIntent

        const expectedCommand = createConfirmPaymentIntentCommandFixture({
          policyId: 'APP463109486',
          amount: stripePaymentIntent.amount,
          externalId: stripePaymentIntent.id,
          rawPaymentIntent: stripePaymentIntent
        })

        sinon.stub(container, 'ConfirmPaymentIntentForPolicy')
          .withArgs(expectedCommand)
          .rejects(new Error())

        response = await httpServer.api()
          .post('/internal/v0/payment-processor/event-handler/')
          .set('stripe-signature', stripeHeaderSignature)
          .send(event)

        expect(response).to.have.property('statusCode', 500)
      })
    })
  })
})
