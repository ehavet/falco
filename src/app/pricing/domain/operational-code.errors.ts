export class OperationalCodeNotApplicableError extends Error {
  constructor (operationalCode: string, partnerCode: string) {
    const message: string = `The operational code ${operationalCode} is not applicable for partner : ${partnerCode}`
    super(message)
    this.name = 'OperationalCodeNotApplicableError'
  }
}
