export class SignatureRequestCreationFailureError extends Error {
  constructor (policyId: string) {
    const message: string = `Could not create signature request for policy: ${policyId}`
    super(message)
    this.name = 'SignatureRequestCreationFailureError'
  }
}
