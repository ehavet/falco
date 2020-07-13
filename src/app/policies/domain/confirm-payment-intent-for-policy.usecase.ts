import { PolicyRepository } from './policy.repository'
import { Policy } from './policy'

export interface ConfirmPaymentIntentForPolicy {
    (policyId: string): Promise<void>
}

export namespace ConfirmPaymentIntentForPolicy {
    export function factory (
      policyRepository: PolicyRepository
    ): ConfirmPaymentIntentForPolicy {
      return async (policyId: string) => {
        const currentDate: Date = new Date()
        await policyRepository.updateAfterPayment(policyId, currentDate, currentDate, Policy.Status.Applicable)
      }
    }
}
