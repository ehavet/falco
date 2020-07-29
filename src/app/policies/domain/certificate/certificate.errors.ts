export class CannotGeneratePolicyNotApplicableError extends Error {
  constructor () {
    const message: string = 'Could not generate the certificate because the policy is not applicable yet'
    super(message)
    this.name = 'CannotGeneratePolicyNotApplicableError'
  }
}

export class CertificateGenerationError extends Error {
  constructor (policyId: string) {
    const message: string = `An error occurred while generating certificate for policy: ${policyId}`
    super(message)
    this.name = 'CertificateGenerationError'
  }
}
