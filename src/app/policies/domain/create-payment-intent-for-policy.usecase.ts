import { PaymentIntentQuery } from './payment-intent-query'
import { PaymentIntent } from './payment-intent'
import { PaymentProcessor } from './payment-processor'
import { PolicyRepository } from './policy.repository'
import { Policy } from './policy'
import { PolicyAlreadyPaidError, PolicyCanceledError } from './policies.errors'
import { Amount } from '../../common-api/domain/amount/amount'

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

        const paymentIntent = await paymentProcessor.createPaymentIntent(policy.id, Amount.multiply(policy.premium, 100), policy.insurance.currency, policy.partnerCode)

        return {
          id: paymentIntent.id,
          amount: Amount.divide(paymentIntent.amount, 100),
          currency: paymentIntent.currency
        }
      }
    }
}
