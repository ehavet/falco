import { Policy } from './policy'

export interface PolicyRepository {
    save(policy: Policy): Promise<Policy>,
    isIdAvailable(policyId: string): Promise<boolean>
    get(id: string): Promise<Policy>
}
