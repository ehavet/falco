export class PartnerInformationNotFoundError extends Error {
  constructor (partnerName: string) {
    const message: string = `Could not find partner with name : ${partnerName}`
    super(message)
    this.name = 'PartnerInformationNotFoundError'
  }
}
