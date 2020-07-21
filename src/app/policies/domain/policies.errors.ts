export class PolicyNotFoundError extends Error {
  constructor (policyId: string) {
    const message: string = `Could not find policy with id : ${policyId}`
    super(message)
    this.name = 'PolicyNotFoundError'
  }
}

export class PolicyAlreadyPaidError extends Error {
  constructor (policyId: string) {
    const message: string = `Policy ${policyId} has already been paid`
    super(message)
    this.name = 'PolicyAlreadyPaidError'
  }
}

export class PolicyAlreadySignedError extends Error {
  constructor (policyId: string) {
    const message: string = `Policy ${policyId} has already been signed`
    super(message)
    this.name = 'PolicyAlreadySignedError'
  }
}
