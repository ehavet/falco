export class SpecificTermsAlreadyCreatedError extends Error {
  constructor (policyId: string) {
    const message: string = `Specific terms for the policy ${policyId} have already been generated`
    super(message)
    this.name = 'SpecificTermsAlreadyCreatedError'
  }
}

export class SpecificTermsNotFoundError extends Error {
  constructor (specificTermsName: string) {
    const message: string = `Specific terms ${specificTermsName} not found`
    super(message)
    this.name = 'SpecificTermsNotFoundError'
  }
}
