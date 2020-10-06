import { Payment } from '../../../../../src/app/policies/domain/payment/payment'

export function createPaymentFixture (attr: Partial<Payment> = {}): Payment {
  const now: Date = new Date('2020-01-05T10:09:08Z')
  return {
    amount: 100000,
    currency: Payment.Curreny.EUR,
    processor: Payment.Processor.STRIPE,
    instrument: Payment.Instrument.CREDITCARD,
    externalId: 'pi_1DgjcP2eZvKYlo2CcMcqZ3qi',
    pspFee: 150,
    status: Payment.Status.VALID,
    payedAt: now,
    cancelledAt: null,
    policyId: 'APP543172845',
    ...attr
  }
}
