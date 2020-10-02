export interface Payment {
    id?: Payment.PaymentId,
    amount: Payment.AmountInCents,
    currency: Payment.Curreny,
    processor: Payment.Processor,
    instrument: Payment.Instrument,
    externalId: string,
    pspFee: Payment.AmountInCents,
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

    export enum Curreny {
        EUR = 'EUR'
    }

    export enum Instrument {
        CREDITCARD = 'CREDITCARD'
    }

    export enum Status {
        VALID = 'VALID',
        CANCELLED = 'CANCELLED'
    }
}
