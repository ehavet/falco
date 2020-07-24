import { expect, HttpServerForTesting, newMinimalServer, sinon } from '../../../../test-utils'
import { container, policiesRoutes } from '../../../../../src/app/policies/policies.container'
import * as supertest from 'supertest'
import { signatureRequestEventFixture } from '../../fixtures/signatureRequestEvent.fixture'

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
        .field('json', JSON.stringify(signatureRequestEventJSON()))

      expect(response).to.have.property('statusCode', 200)
      expect(response).to.have.property('text', 'Hello API Event Received')
    })
  })
})

function signatureRequestEventJSON () {
  return {
    account_guid: '63522885f9261e2b04eea043933ee7313eb674fd',
    client_id: null,
    event: {
      event_time: '1348177752',
      event_type: 'signature_request_sent',
      event_hash: '3a31324d1919d7cdc849ff407adf38fc01e01107d9400b028ff8c892469ca947',
      event_metadata: {
        related_signature_id: 'ad4d8a769b555fa5ef38691465d426682bf2c992',
        reported_for_account_id: '63522885f9261e2b04eea043933ee7313eb674fd',
        reported_for_app_id: null
      }
    },
    signature_request: {
      signature_request_id: '21bb8f947df4ad622c103f662543b230b713d',
      test_mode: false,
      title: 'Signature Request Title',
      original_title: 'Original Signature Request Title',
      subject: null,
      message: 'Please sign this document.',
      metadata: {
        policyId: 'APP453627845',
        contractFileName: 'Appenin_Contrat_assurance_habitation_APP645372859'
      }
    }
  }
}
