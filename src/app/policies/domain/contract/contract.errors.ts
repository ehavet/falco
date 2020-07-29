export class SignedContractNotFoundError extends Error {
  constructor (contractFilename: string) {
    const message: string = `Could not find the signed contract with name ${contractFilename}`
    super(message)
    this.name = 'SignedContractNotFoundError'
  }
}
