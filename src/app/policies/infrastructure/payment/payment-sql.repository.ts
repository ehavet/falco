import { PaymentRepository } from '../../domain/payment/payment.repository'
import { Payment } from '../../domain/payment/payment'
import { PaymentSqlModel } from './payment-sql.model'
import { sqlToDomain } from './payment-sql.mapper'
import { PaymentPolicySqlModel } from './payment-policy-sql.model'

export class PaymentSqlRepository implements PaymentRepository {
  async save (payment: Payment): Promise<Payment> {
    const savedPaymentSql = await PaymentSqlModel.create(payment)
    await PaymentPolicySqlModel.create({ paymentId: savedPaymentSql.id, policyId: payment.policyId })

    return sqlToDomain(savedPaymentSql, payment.policyId)
  }
}
