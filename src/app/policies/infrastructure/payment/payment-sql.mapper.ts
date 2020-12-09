import { PaymentSqlModel } from './payment-sql.model'
import { Payment } from '../../domain/payment/payment'
import { toAmount } from '../../../common-api/domain/amount/amount'

export function sqlToDomain (paymentSql: PaymentSqlModel, policyId: string): Payment {
  return {
    id: paymentSql.id,
    amount: toAmount(paymentSql.amount),
    currency: paymentSql.currency,
    processor: paymentSql.processor,
    method: paymentSql.method,
    externalId: paymentSql.externalId,
    pspFee: toAmount(paymentSql.pspFee),
    status: paymentSql.status,
    payedAt: paymentSql.payedAt,
    cancelledAt: paymentSql.cancelledAt,
    policyId: policyId
  }
}
