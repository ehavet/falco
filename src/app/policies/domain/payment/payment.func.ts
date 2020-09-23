import { Payment } from './payment'

export function createValidPayment (policyId: string, externalId: string, amount: Payment.AmountInCents,
  processor: Payment.Processor, instrument: Payment.Instrument): Payment {
  return {
    amount: amount,
    currency: Payment.Curreny.EUR,
    processor: processor,
    instrument: instrument,
    externalId,
    status: Payment.Status.VALID,
    payedAt: new Date(),
    cancelledAt: null,
    policyId
  }
}
