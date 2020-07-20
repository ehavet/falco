export class SignatureRequestCreationFailureError extends Error {
  constructor (policyId: string) {
    const message: string = `An error occurred while creating signature request for policy: ${policyId}`
    super(message)
    this.name = 'SignatureRequestCreationFailureError'
  }
}

export class SpecificTermsGenerationFailureError extends Error {
  constructor (policyId: string) {
    const message: string = `An error occurred while generating specific terms for policy: ${policyId}`
    super(message)
    this.name = 'SpecificTermsGenerationFailureError'
  }
}

export class ContractGenerationFailureError extends Error {
  constructor (policyId: string) {
    const message: string = `An error occurred while generating contract for policy: ${policyId}`
    super(message)
    this.name = 'ContractGenerationFailureError'
  }
}
