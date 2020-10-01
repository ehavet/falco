import { PaymentRepository } from '../../domain/payment/payment.repository'
import { Payment } from '../../domain/payment/payment'
import { PaymentSqlModel } from './payment-sql.model'
import { sqlToDomain } from './payment-sql.mapper'

export class PaymentSqlRepository implements PaymentRepository {
  async save (payment: Payment): Promise<Payment> {
    const savedPaymentSql = await PaymentSqlModel.create(payment)

    return sqlToDomain(savedPaymentSql)
  }
}
