import { Payment } from './payment'
import { Amount } from '../../../common-api/domain/amount/amount'

export function createValidPayment (policyId: string, externalId: string, amount: Amount,
  processor: Payment.Processor, method: Payment.Method, pspFee: Amount | null): Payment {
  return {
    amount,
    currency: Payment.Currency.EUR,
    processor,
    method,
    externalId,
    pspFee,
    status: Payment.Status.VALID,
    payedAt: new Date(),
    cancelledAt: null,
    policyId
  }
}
