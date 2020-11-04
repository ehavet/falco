export interface EmailValidationQuery {
    email: string,
    callbackUrl: string,
    partnerCode: string,
    policyId?: string,
    quoteId?: string
}
