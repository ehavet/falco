import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { Policy } from '../domain/policy'

export class PolicySqlRepository implements PolicyRepository {
  save (policy: Policy): Promise<Policy> {
    return Promise.reject(new Error(`Not implemented yet ${policy.id}`))
  }

  isIdAvailable (policyId: string): Promise<boolean> {
    return Promise.reject(new Error(`Not implemented yet ${policyId}`))
  }
}
