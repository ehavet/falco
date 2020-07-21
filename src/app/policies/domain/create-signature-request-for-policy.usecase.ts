import { SignatureRequest } from './signature-request'
import { PolicyRepository } from './policy.repository'
import { SignatureRequester } from './signature-requester'
import { ContractGenerationFailureError, SignatureRequestCreationFailureError, SpecificTermsGenerationFailureError } from './signature-request.errors'
import { ContractGenerator } from './contract/contract.generator'
import { ContractRepository } from './contract/contract.repository'
import { SpecificTermsGenerator } from './specific-terms/specific-terms.generator'
import { SpecificTermsRepository } from './specific-terms/specific-terms.repository'
import { Policy } from './policy'
import { SpecificTerms } from './specific-terms/specific-terms'
import { Contract } from './contract/contract'
import { Signer } from './signer'
import { PolicyAlreadySignedError } from './policies.errors'

export interface CreateSignatureRequestForPolicy {
    (policyId: string): Promise<SignatureRequest>
}

export namespace CreateSignatureRequestForPolicy {
    export function factory (
      specificTermsGenerator: SpecificTermsGenerator,
      specificTermsRepository: SpecificTermsRepository,
      contractGenerator: ContractGenerator,
      contractRepository: ContractRepository,
      policyRepository: PolicyRepository,
      signatureRequester: SignatureRequester
    ): CreateSignatureRequestForPolicy {
      return async (policyId: string): Promise<SignatureRequest> => {
        const policy: Policy = await policyRepository.get(policyId)
        let specificTerms: SpecificTerms
        let contract: Contract

        if (Policy.isSigned(policy)) {
          throw new PolicyAlreadySignedError(policy.id)
        }

        try {
          specificTerms = await specificTermsGenerator.generate(policy)
        } catch (error) {
          throw new SpecificTermsGenerationFailureError(policy.id)
        }
        await specificTermsRepository.save(specificTerms, policyId)
        try {
          contract = await contractGenerator.generate(policyId, specificTerms)
        } catch (error) {
          throw new ContractGenerationFailureError(policyId)
        }
        const contractFilePath = await contractRepository.saveTempContract(contract)
        try {
          const signer: Signer = {
            emailAdress: policy.contact.email,
            name: `${policy.contact.firstname} ${policy.contact.lastname}`,
            policyId: policy.id
          }
          return await signatureRequester.create(contractFilePath, signer)
        } catch (error) {
          throw new SignatureRequestCreationFailureError(policyId)
        }
      }
    }
}
