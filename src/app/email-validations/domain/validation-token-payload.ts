export interface ValidationTokenPayload {
    email: string,
    callbackUrl: string,
    policyId?: string,
    quoteId?: string,
    expiredAt: Date
}

export namespace ValidationTokenPayload {
    export function isTokenExpired (validationTokenPayload: ValidationTokenPayload): boolean {
      return (validationTokenPayload.expiredAt < new Date())
    }

    export function isTokenInconsistent (validationTokenPayload: ValidationTokenPayload): boolean {
      return _hasPolicyIdAndQuoteId(validationTokenPayload) || _hasNoPolicyIdorQuoteId(validationTokenPayload)
    }
}

function _hasPolicyIdAndQuoteId (validationTokenPayload: ValidationTokenPayload): boolean {
  return !!(validationTokenPayload.policyId && validationTokenPayload.quoteId)
}

function _hasNoPolicyIdorQuoteId (validationTokenPayload: ValidationTokenPayload): boolean {
  return !(validationTokenPayload.policyId || validationTokenPayload.quoteId)
}
