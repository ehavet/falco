export class PartnerNotFoundError extends Error {
  constructor (partnerCode: string) {
    const message: string = `Could not find partner with code : ${partnerCode}`
    super(message)
    this.name = 'PartnerNotFoundError'
  }
}
