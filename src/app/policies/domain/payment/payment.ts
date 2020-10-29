export interface Payment {
    id?: Payment.PaymentId,
    amount: Payment.AmountInCents,
    currency: Payment.Currency,
    processor: Payment.Processor,
    method: Payment.Method,
    externalId: string,
    pspFee: Payment.AmountInCents | null, // can be null if the value cannot be retrieved
    status: Payment.Status,
    payedAt: Date,
    cancelledAt: Date | null,
    policyId: string
}

export namespace Payment {

    export type PaymentId = string

    export type AmountInCents = number

    export enum Processor {
        STRIPE = 'STRIPE'
    }

    export enum Currency {
        EUR = 'EUR'
    }

    export enum Method {
        CREDITCARD = 'CREDITCARD'
    }

    export enum Status {
        VALID = 'VALID',
        CANCELLED = 'CANCELLED'
    }
}
