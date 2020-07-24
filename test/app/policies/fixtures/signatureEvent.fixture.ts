import { SignatureEventType } from '../../../../src/app/policies/domain/signature/signature-event'

export function signatureEventFixture (attr = {}) {
  return {
    requestId: '21bb8f947df4ad622c103f662543b230b713d',
    time: '1348177752',
    type: SignatureEventType.Signed,
    hash: '3a31324d1919d7cdc849ff407adf38fc01e01107d9400b028ff8c892469ca947',
    policyId: 'APP453627845',
    contractFileName: 'Appenin_Contrat_assurance_habitation_APP645372859',
    ...attr
  }
}
