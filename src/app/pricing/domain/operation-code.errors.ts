export class OperationCodeNotApplicableError extends Error {
  constructor (operationCode: string, partnerCode: string) {
    const message: string = `The operation code ${operationCode} is not applicable for partner : ${partnerCode}`
    super(message)
    this.name = 'OperationCodeNotApplicableError'
  }
}
