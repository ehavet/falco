export interface PaymentProcessor {
    createIntent(policyId: string, amount: number, currency: string)
    getTransactionFee(rawPaymentIntent: any): Promise<number | null>
    createIntentForDemoPartner(policyId: string, amount: number, currency: string)
}
