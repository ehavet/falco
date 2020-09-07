import { PaymentIntentQuery } from './payment-intent-query'
import { PaymentIntent } from './payment-intent'
import { PaymentProcessor } from './payment-processor'
import { PolicyRepository } from './policy.repository'
import { Policy } from './policy'
import { PolicyAlreadyPaidError, PolicyCanceledError } from './policies.errors'

export interface CreatePaymentIntentForPolicy {
    (paymentIntentQuery: PaymentIntentQuery): Promise<PaymentIntent>
}

export namespace CreatePaymentIntentForPolicy {
    export function factory (
      paymentProcessor: PaymentProcessor,
      policyRepository: PolicyRepository
    ): CreatePaymentIntentForPolicy {
      return async (paymentIntentQuery: PaymentIntentQuery) => {
        const policy: Policy = await policyRepository.get(paymentIntentQuery.policyId)

        if (Policy.isCancelled(policy)) { throw new PolicyCanceledError(policy.id) }
        if (policy.status === Policy.Status.Applicable) { throw new PolicyAlreadyPaidError(policy.id) }

        const intent = await paymentProcessor.createIntent(policy.id, _toZeroDecimal(policy.premium), policy.insurance.currency)

        return {
          id: intent.id,
          amount: _toTwoDecimal(intent.amount),
          currency: intent.currency
        }
      }
    }
}

function _toZeroDecimal (amount: number): number {
  return amount * 100
}

function _toTwoDecimal (amount: number): number {
  return parseFloat((amount / 100).toFixed(2))
}
