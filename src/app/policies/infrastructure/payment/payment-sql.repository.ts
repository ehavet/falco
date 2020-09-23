import { PaymentRepository } from '../../domain/payment/payment.repository'
import { Payment } from '../../domain/payment/payment'

export class PaymentSqlRepository implements PaymentRepository {
  // @ts-ignore
  async save (payment: Payment): Promise<Payment> {
    throw new Error('Not implemented yet')
  }
}
