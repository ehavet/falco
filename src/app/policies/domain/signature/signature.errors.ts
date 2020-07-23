export class SignedContractDownloadError extends Error {
  constructor (signatureRequest: string) {
    const message: string = `Could not download the signed contract for request ${signatureRequest}`
    super(message)
    this.name = 'SignedContractDownloadError'
  }
}
