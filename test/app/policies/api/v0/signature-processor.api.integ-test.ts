import { expect, HttpServerForTesting, newMinimalServer } from '../../../../test-utils'
import { policiesRoutes } from '../../../../../src/app/policies/policies.container'
import * as supertest from 'supertest'
import { signatureEventFixture } from '../../fixtures/signatureEvent.fixture'

describe.skip('Signature Event Handler - API - Integration', async () => {
  let httpServer: HttpServerForTesting

  const eventExample = signatureEventFixture()

  describe('POST /internal/v0/signature-processor/event-handler/', async () => {
    let response: supertest.Response

    before(async () => {
      httpServer = await newMinimalServer(policiesRoutes())
    })

    describe('when success', () => {
      it('should reply with status 200', async () => {
        response = await httpServer.api()
          .post('/internal/v0/signature-processor/event-handler/')
          .send(eventExample)

        expect(response).to.have.property('statusCode', 200)
        expect(response).to.have.property('text', 'Hello API Event Received')
      })
    })
  })
})
