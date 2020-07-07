export class PolicyNotFoundError extends Error {
  constructor (policyId: string) {
    const message: string = `Could not find policy with id : ${policyId}`
    super(message)
    this.name = 'PolicyNotFoundError'
  }
}
