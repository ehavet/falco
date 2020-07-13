import { Policy } from './policy'

export interface PolicyRepository {
    save(policy: Policy): Promise<Policy>,
    isIdAvailable(policyId: string): Promise<boolean>,
    get(id: string): Promise<Policy>,
    setEmailValidationDate(policyId: string, date: Date): Promise<void>
    updateAfterPayment(policyId: string, paymentDate: Date, subscriptionDate: Date, status: Policy.Status): Promise<void>
}
