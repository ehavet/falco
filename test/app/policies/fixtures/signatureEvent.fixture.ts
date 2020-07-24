import { SignatureEventType } from '../../../../src/app/policies/domain/signature/signature-request-event'

export function signatureEventFixture (attr = {}) {
  return {
    requestId: '21bb8f947df4ad622c103f662543b230b713d',
    type: SignatureEventType.Signed,
    policyId: 'APP453627845',
    contractFileName: 'Appenin_Contrat_assurance_habitation_APP645372859',
    validation: {
      rawEventType: 'signature_request_sent',
      time: '1348177752',
      hash: '3a31324d1919d7cdc849ff407adf38fc01e01107d9400b028ff8c892469ca947'
    },
    ...attr
  }
}
