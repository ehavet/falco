import { Quote } from './quote'

export class NoPartnerInsuranceForRiskError extends Error {
  constructor (partnerCode: string, risk: Quote.Risk) {
    const message: string = `Partner with code ${partnerCode} does not have an insurance for risk ${JSON.stringify(risk)}`
    super(message)
    this.name = 'NoPartnerInsuranceForRiskError'
  }
}

export class QuoteNotFoundError extends Error {
  constructor (quoteId: string) {
    const message: string = `Quote with id ${quoteId} cannot be found`
    super(message)
    this.name = 'QuoteNotFoundError'
  }
}
