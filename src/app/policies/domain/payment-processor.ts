export interface PaymentProcessor {
    createIntent(policyId: string, amount: number, currency: string)
}
