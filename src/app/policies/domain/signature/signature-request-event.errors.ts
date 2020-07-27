export class SignatureRequestEventValidationError extends Error {
  constructor () {
    const message: string = 'Signature request event validation failed'
    super(message)
    this.name = 'SignatureRequestEventValidationError'
  }
}
