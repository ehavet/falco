export class SubscriptionValidationEmailBuildError extends Error {
  constructor (policyId: string) {
    const message: string = `An error occurred while building validation email for policy: ${policyId}`
    super(message)
    this.name = 'SubscriptionValidationEmailBuildError'
  }
}
