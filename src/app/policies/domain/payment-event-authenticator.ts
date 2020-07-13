export interface PaymentEventAuthenticator {
    parse(payload, signature)
}
