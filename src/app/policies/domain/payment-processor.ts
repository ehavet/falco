export interface PaymentProcessor {
    createIntent(amount: number, currency: string)
}
