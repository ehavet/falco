export class SpecificTermsAlreadyCreatedError extends Error {
  constructor (policyId: string) {
    const message: string = `Specific terms for the policy ${policyId} have already been generated`
    super(message)
    this.name = 'SpecificTermsAlreadyCreatedError'
  }
}
