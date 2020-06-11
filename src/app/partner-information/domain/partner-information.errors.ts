export class PartnerInformationNotFoundError extends Error {
  constructor (partnerKey: string) {
    const message: string = `Could not find partner with key : ${partnerKey}`
    super(message)
    this.name = 'PartnerInformationNotFoundError'
  }
}
