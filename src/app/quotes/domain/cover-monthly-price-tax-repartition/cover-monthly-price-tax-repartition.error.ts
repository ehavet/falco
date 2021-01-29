export class CoverMonthlyPriceTaxRepartitionNotFoundError extends Error {
  constructor (partnerCode: string) {
    const message: string = `Could not find cover monthly price tax repartition for partner : ${partnerCode}`
    super(message)
    this.name = 'CoverMonthlyPriceTaxRepartitionNotFoundError'
  }
}

export class CoverMonthlyPriceTaxRepartitionConsistencyError extends Error {
  constructor (partnerCode: string) {
    const message: string = `Inconsistent cover monthly price tax repartition set for partner : ${partnerCode}`
    super(message)
    this.name = 'CoverMonthlyPriceTaxRepartitionConsistencyError'
  }
}
