export interface ValidationTokenPayload {
    email: string,
    callbackUrl: string,
    policyId: string,
    expiredAt: Date
}
