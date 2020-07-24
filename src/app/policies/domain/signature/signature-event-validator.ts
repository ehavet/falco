import SignatureRequestEvent from './signature-request-event'

export interface SignatureEventValidator {
    isValid(event: SignatureRequestEvent)
}
