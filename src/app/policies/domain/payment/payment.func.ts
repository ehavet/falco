import { Payment } from './payment'

export function createValidPayment (policyId: string, externalId: string, amount: Payment.AmountInCents,
  processor: Payment.Processor, instrument: Payment.Instrument, pspFee: number | null): Payment {
  return {
    amount,
    currency: Payment.Currency.EUR,
    processor,
    instrument,
    externalId,
    pspFee,
    status: Payment.Status.VALID,
    payedAt: new Date(),
    cancelledAt: null,
    policyId
  }
}
