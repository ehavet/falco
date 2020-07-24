import SignatureEvent from './signature-event'

export interface SignatureEventValidator {
    isValid(event: SignatureEvent)
}
