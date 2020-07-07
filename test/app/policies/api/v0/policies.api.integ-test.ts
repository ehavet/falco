import { HttpServerForTesting, newMinimalServer } from '../../../../utils/server.test-utils'
import { container, policiesRoutes } from '../../../../../src/app/policies/policies.container'
import * as supertest from 'supertest'
import { expect, sinon } from '../../../../test-utils'
import { PolicyNotFoundError } from '../../../../../src/app/policies/domain/policies.errors'

describe('Http API integration - Policies', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(policiesRoutes())
  })

  describe('POST /v0/policies/:id/payment-intents', () => {
    let response: supertest.Response

    describe('when success', () => {
      const expectedPaymentIntent = { id: 'pi_P4Ym3NtInT3nt1d' }

      beforeEach(async () => {
        sinon.stub(container, 'CreatePaymentIntent')
          .withArgs({ policyId: 'p0l1cy1d' })
          .resolves(expectedPaymentIntent)

        response = await httpServer.api()
          .post('/v0/policies/p0l1cy1d/payment-intents')
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return a payment intent id', async () => {
        expect(response.body).to.deep.equal(expectedPaymentIntent)
      })
    })

    describe('when the policy is not found', () => {
      it('should reply with status 404', async () => {
        const policyId: string = 'p0l1cy1d'
        sinon.stub(container, 'CreatePaymentIntent')
          .withArgs({ policyId: policyId })
          .rejects(new PolicyNotFoundError(policyId))

        response = await httpServer.api()
          .post('/v0/policies/p0l1cy1d/payment-intents')

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${policyId}`)
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        sinon.stub(container, 'CreatePaymentIntent')
          .withArgs({ policyId: 'p0l1cy1d' })
          .rejects(new Error())

        response = await httpServer.api()
          .post('/v0/policies/p0l1cy1d/payment-intents')

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when wrong policy id format', async () => {
        response = await httpServer.api()
          .post('/v0/policies/01234567890123456789' +
              '012345678901234567890123456789' +
              '012345678901234567890123456789' +
              '01234567890123456789_T00_L0NG_1D/payment-intents')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })
})
