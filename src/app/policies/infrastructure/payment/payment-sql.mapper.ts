import { PaymentSqlModel } from './payment-sql.model'
import { Payment } from '../../domain/payment/payment'

export function sqlToDomain (paymentSql: PaymentSqlModel): Payment {
  return {
    id: paymentSql.id,
    amount: paymentSql.amount,
    currency: paymentSql.currency,
    processor: paymentSql.processor,
    instrument: paymentSql.instrument,
    externalId: paymentSql.externalId,
    pspFee: paymentSql.pspFee,
    status: paymentSql.status,
    payedAt: paymentSql.payedAt,
    cancelledAt: paymentSql.cancelledAt,
    policyId: paymentSql.policyId
  }
}
