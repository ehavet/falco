export class SignatureEventValidationError extends Error {
  constructor () {
    const message: string = 'Signature event validation failed'
    super(message)
    this.name = 'SignatureEventValidationError'
  }
}
