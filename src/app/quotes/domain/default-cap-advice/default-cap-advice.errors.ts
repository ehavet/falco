export class DefaultCapAdviceNotFoundError extends Error {
  constructor (partnerCode: string, roomCount: number) {
    const message: string = `Could not find default cap advice for partner ${partnerCode} and room count ${roomCount}`
    super(message)
    this.name = 'DefaultCapAdviceNotFoundError'
  }
}
