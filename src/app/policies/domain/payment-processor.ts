import { Amount } from '../../common-api/domain/amount/amount'

export interface PaymentProcessor {
    createPaymentIntent(policyId: string, amount: Amount, currency: string, partnerCode: string): Promise<PaymentIntent>
    getTransactionFee(rawPaymentIntent: any): Promise<Amount | null>
}

export type PaymentIntent = {
    id: string
    amount: Amount
    currency: string
}
