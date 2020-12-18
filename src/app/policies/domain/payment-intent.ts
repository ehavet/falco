import { Amount } from '../../common-api/domain/amount/amount'

export interface PaymentIntent {
    id: string
    amount: Amount
    currency: string
}
