import { Amount } from '../../../common-api/domain/amount/amount'

export interface Payment {
    id?: Payment.PaymentId,
    amount: Amount,
    currency: Payment.Currency,
    processor: Payment.Processor,
    method: Payment.Method,
    externalId: string,
    pspFee: Amount | null, // can be null if the value cannot be retrieved
    status: Payment.Status,
    payedAt: Date,
    cancelledAt: Date | null,
    policyId: string
}

export namespace Payment {

    export type PaymentId = string

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
