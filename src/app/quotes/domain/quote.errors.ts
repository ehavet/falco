import { Quote } from './quote'

export class NoPartnerInsuranceForRiskError extends Error {
  constructor (partnerCode: string, risk: Quote.Risk) {
    const message: string = `Partner with code ${partnerCode} does not have an insurance for risk ${JSON.stringify(risk)}`
    super(message)
    this.name = 'NoPartnerInsuranceForRiskError'
  }
}
