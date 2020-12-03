export interface PaymentProcessor {
    createPaymentIntent(policyId: string, amount: number, currency: string, partnerCode: string): Promise<PaymentIntent>
    getTransactionFee(rawPaymentIntent: any): Promise<number | null>
}

export type PaymentIntent = {
    id: string
    amount: number
    currency: string
}
