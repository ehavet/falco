import { HelloSignRequestEventValidator } from '../../../../src/app/policies/infrastructure/signature/hello-sign-request-event.validator'
import { helloSignConfigTest } from '../../../configs/hellosign.test.config'

export function signatureRequestEventJSONFixture (attr = {}) {
  const fakeEventFixture = generateFakeEventFixture()
  return {
    account_guid: '63522885f9261e2b04eea043933ee7313eb674fd',
    client_id: null,
    event: {
      event_time: fakeEventFixture.time,
      event_type: fakeEventFixture.eventType,
      event_hash: fakeEventFixture.hash,
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
    },
    ...attr
  }
}

/**
 * Use to generate an 'Event' object based on your own HelloSign key
 */
// eslint-disable-next-line camelcase
function generateFakeEventFixture (): { hash: string, time: string, eventType: string } {
  const helloSignRequestEventValidator = new HelloSignRequestEventValidator(helloSignConfigTest)

  const fakeTimestamp = '1348177752'
  const signatureRequestEventType = 'signature_request_signed'
  const generatedHash = helloSignRequestEventValidator.generateHash(fakeTimestamp, signatureRequestEventType)
  return { hash: generatedHash, time: fakeTimestamp, eventType: signatureRequestEventType }
}
