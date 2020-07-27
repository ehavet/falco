export function signatureRequestEventJSONFixture (attr = {}) {
  return {
    account_guid: '63522885f9261e2b04eea043933ee7313eb674fd',
    client_id: null,
    event: {
      event_time: '1348177752',
      event_type: 'signature_request_sent',
      event_hash: '55344e8eb55e396c6ad85cf1a9b7fc128ebf9adb81ac9c77503729e477faf7d2',
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
