export class CannotGeneratePolicyNotApplicable extends Error {
  constructor () {
    const message: string = 'Could not generate the certificate because the policy is not applicable yet'
    super(message)
    this.name = 'CannotGeneratePolicyNotApplicable'
  }
}
