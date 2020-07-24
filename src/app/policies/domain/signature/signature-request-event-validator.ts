import SignatureRequestEvent from './signature-request-event'

export interface SignatureRequestEventValidator {
    isValid(event: SignatureRequestEvent)
}
