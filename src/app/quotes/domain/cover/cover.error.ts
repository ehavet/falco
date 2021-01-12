export class CoverNotFoundError extends Error {
  constructor (partnerCode: string) {
    const message: string = `Could not find cover for partner : ${partnerCode}`
    super(message)
    this.name = 'CoverNotFoundError'
  }
}
