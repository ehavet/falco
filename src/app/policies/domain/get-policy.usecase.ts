import { PolicyRepository } from './policy.repository'
import { Policy } from './policy'
import { GetPolicyQuery } from './get-policy-query'

export interface GetPolicy {
    (getPolicyQuery: GetPolicyQuery): Promise<Policy>
}

export namespace GetPolicy {
    export function factory (policyRepository: PolicyRepository): GetPolicy {
      return async (getPolicyQuery: GetPolicyQuery) => {
        return policyRepository.get(getPolicyQuery.policyId)
      }
    }
}
