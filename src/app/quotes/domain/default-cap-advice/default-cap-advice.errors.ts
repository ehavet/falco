export class DefaultCapAdviceNotFoundError extends Error {
  constructor (partnerCode: string, roomCount: number) {
    const message: string = `Could not find default cap advice for partner ${partnerCode} and room count ${roomCount}`
    super(message)
    this.name = 'DefaultCapAdviceNotFoundError'
  }
}

export class MultipleDefaultCapAdviceFoundError extends Error {
  constructor (partnerCode: string, roomCount: number) {
    const message: string = `Multiple default cap advice where found for partner ${partnerCode} and room count ${roomCount}`
    super(message)
    this.name = 'MultipleDefaultCapAdviceFoundError'
  }
}
