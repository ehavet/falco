export interface PaymentProcessor {
    createIntent(policyId: string, amount: number, currency: string, partnerCode: string): Promise<Intent>
    getTransactionFee(rawPaymentIntent: any): Promise<number | null>
}

export type Intent = {
    id: string
    amount: number
    currency: string
}
