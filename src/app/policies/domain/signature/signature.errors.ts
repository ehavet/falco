export class SignedContractDownloadError extends Error {
  constructor (signatureRequest: string) {
    const message: string = `Could not download the signed contract for request ${signatureRequest}`
    super(message)
    this.name = 'SignedContractDownloadError'
  }
}

export class SignedContractDownloadNotFound extends Error {
  constructor (signatureRequestId: string, filename: string) {
    const message: string = `Could not find the signed contract with name ${filename} for request ${signatureRequestId}`
    super(message)
    this.name = 'SignedContractDownloadError'
  }
}
