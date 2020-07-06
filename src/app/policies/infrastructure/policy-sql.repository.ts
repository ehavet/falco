import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'

export class PolicySqlRepository implements PolicyRepository {
  isIdAvailable (policyId: string): Promise<boolean> {
    return Promise.reject(new Error(`Not implemented yet ${policyId}`))
  }
}
