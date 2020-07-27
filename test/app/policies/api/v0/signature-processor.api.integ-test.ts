import { expect, HttpServerForTesting, newMinimalServer, sinon } from '../../../../test-utils'
import { container, policiesRoutes } from '../../../../../src/app/policies/policies.container'
import * as supertest from 'supertest'
import { signatureRequestEventFixture } from '../../fixtures/signatureRequestEvent.fixture'
import { signatureRequestEventJSONFixture } from '../../fixtures/signatureRequestEventJSON.fixture'

describe('Signature Event Handler - API - Integration', async () => {
  let httpServer: HttpServerForTesting

  const signatureRequestEvent = signatureRequestEventFixture()

  describe('POST /internal/v0/signature-processor/event-handler/', async () => {
    let response: supertest.Response

    before(async () => {
      httpServer = await newMinimalServer(policiesRoutes())
    })

    it('should reply with status 200', async () => {
      sinon.stub(container, 'ManageSignatureRequestEvent').withArgs({ event: signatureRequestEvent }).resolves()

      response = await httpServer.api()
        .post('/internal/v0/signature-processor/event-handler/')
        .type('multipart/form-data')
        .field('json', JSON.stringify(signatureRequestEventJSONFixture()))

      expect(response).to.have.property('statusCode', 200)
      expect(response).to.have.property('text', 'Hello API Event Received')
    })
  })
})
