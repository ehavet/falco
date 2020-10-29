import { Payment } from './payment'

export interface PaymentRepository {
    save(payment: Payment): Promise<Payment>
}
