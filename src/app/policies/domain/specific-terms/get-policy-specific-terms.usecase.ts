import { SpecificTermsRepository } from './specific-terms.repository'
import { SpecificTerms } from './specific-terms'
import { GetPolicySpecificTermsQuery } from './get-policy-specific-terms-query'
import { SpecificTermsGenerator } from './specific-terms.generator'
import { Policy } from '../policy'
import { PolicyCanceledError } from '../policies.errors'
import { PolicyRepository } from '../policy.repository'

export interface GetPolicySpecificTerms {
    (getPolicySpecificTermsQuery: GetPolicySpecificTermsQuery): Promise<SpecificTerms>
}

export namespace GetPolicySpecificTerms {

    export function factory (
      specificTermsRepository: SpecificTermsRepository,
      specificTermsGenerator: SpecificTermsGenerator,
      policyRepository: PolicyRepository
    ): GetPolicySpecificTerms {
      return async (getPolicySpecificTermsQuery: GetPolicySpecificTermsQuery): Promise<SpecificTerms> => {
        const policy: Policy = await policyRepository.get(getPolicySpecificTermsQuery.policyId)
        if (Policy.isCanceled(policy)) { throw new PolicyCanceledError(policy.id) }
        const specificTermsName: string = specificTermsGenerator.getNameFor(getPolicySpecificTermsQuery.policyId)
        return specificTermsRepository.get(specificTermsName)
      }
    }
}
