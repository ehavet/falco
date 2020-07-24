import { SignatureRequestEventType } from '../../../../src/app/policies/domain/signature/signature-request-event'

export function signatureRequestEventFixture (attr = {}) {
  return {
    requestId: '21bb8f947df4ad622c103f662543b230b713d',
    type: SignatureRequestEventType.Signed,
    policyId: 'APP453627845',
    contractFileName: 'Appenin_Contrat_assurance_habitation_APP645372859',
    validation: {
      rawEventType: 'signature_request_sent',
      time: '1348177752',
      hash: '55344e8eb55e396c6ad85cf1a9b7fc128ebf9adb81ac9c77503729e477faf7d2'
    },
    ...attr
  }
}
