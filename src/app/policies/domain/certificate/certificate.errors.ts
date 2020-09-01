export class PolicyForbiddenCertificateGenerationError extends Error {
  constructor () {
    const message: string = 'Could not generate the certificate because the policy is not applicable'
    super(message)
    this.name = 'PolicyForbiddenCertificateGenerationError'
  }
}

export class CertificateGenerationError extends Error {
  constructor (policyId: string) {
    const message: string = `An error occurred while generating certificate for policy: ${policyId}`
    super(message)
    this.name = 'CertificateGenerationError'
  }
}
