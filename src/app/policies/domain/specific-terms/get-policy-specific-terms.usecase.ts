import { SpecificTermsRepository } from './specific-terms.repository'
import { SpecificTerms } from './specific-terms'
import { GetPolicySpecificTermsQuery } from './get-policy-specific-terms-query'
import { SpecificTermsGenerator } from './specific-terms.generator'

export interface GetPolicySpecificTerms {
    (getPolicySpecificTermsQuery: GetPolicySpecificTermsQuery): Promise<SpecificTerms>
}

export namespace GetPolicySpecificTerms {

    export function factory (specificTermsRepository: SpecificTermsRepository, specificTermsGenerator: SpecificTermsGenerator): GetPolicySpecificTerms {
      return async (getPolicySpecificTermsQuery: GetPolicySpecificTermsQuery): Promise<SpecificTerms> => {
        const specificTermsName: string = specificTermsGenerator.getNameFor(getPolicySpecificTermsQuery.policyId)
        return specificTermsRepository.get(specificTermsName)
      }
    }
}
