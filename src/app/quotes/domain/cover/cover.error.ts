export class CoverMonthlyPriceNotFoundError extends Error {
  constructor (partnerCode: string) {
    const message: string = `Could not find cover monthly price for partner : ${partnerCode}`
    super(message)
    this.name = 'CoverMonthlyPriceNotFoundError'
  }
}

export class CoverMonthlyPriceConsistencyError extends Error {
  constructor (partnerCode: string) {
    const message: string = `Inconsistent cover monthly price set for partner : ${partnerCode}`
    super(message)
    this.name = 'CoverMonthlyPriceConsistencyError'
  }
}
