import { PaymentIntentQuery } from './payment-intent-query'
import { PaymentIntent } from './payment-intent'
import { PaymentProcessor } from './payment-processor'
import { PolicyRepository } from './policy.repository'
import { Policy } from './policy'

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
        const intent = await paymentProcessor.createIntent(_toZeroDecimal(policy.premium), policy.insurance.currency)
        return {
          id: intent.id,
          amount: _toTwoDecimal(intent.amount),
          currency: intent.currency
        }
      }
    }
}

function _toZeroDecimal (amount: number): number {
  if ((amount - Math.floor(amount)) !== 0) {
    return amount * 100
  }
  return amount
}

function _toTwoDecimal (amount: number): number {
  if ((amount - Math.floor(amount)) !== 0) {
    return amount
  }
  return parseFloat((amount / 100).toFixed(2))
}
