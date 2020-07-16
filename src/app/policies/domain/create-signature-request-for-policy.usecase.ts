import { SignatureRequest } from './signature-request'
import { PolicyRepository } from './policy.repository'
import { SignatureRequester } from './signature-requester'
import { Policy } from './policy'
import { SignatureRequestCreationFailureError } from './signature-request.errors'

export interface CreateSignatureRequestForPolicy {
    (policyId: string): Promise<SignatureRequest>
}

export namespace CreateSignatureRequestForPolicy {
    export function factory (
      policyRepository: PolicyRepository,
      signatureRequester: SignatureRequester
    ): CreateSignatureRequestForPolicy {
      return async (policyId: string): Promise<SignatureRequest> => {
        const policy: Policy = await policyRepository.get(policyId)
        // eslint-disable-next-line no-console
        console.log(policy)
        try {
          const signatureRequest: SignatureRequest = await signatureRequester.create('/Users/eha/Projects/falco-api/tmp/Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
          return signatureRequest
        } catch (error) {
          throw new SignatureRequestCreationFailureError(policyId)
        }
      }
    }
}
