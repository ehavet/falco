import { Partner } from './partner'

export class PartnerNotFoundError extends Error {
  constructor (partnerCode: string) {
    const message: string = `Could not find partner with code : ${partnerCode}`
    super(message)
    this.name = 'PartnerNotFoundError'
  }
}

export class PartnerQuestionNotFoundError extends Error {
  constructor (partnerCode: string, questionCode: Partner.Question.QuestionCode) {
    const message: string = `Could not find partner question ${questionCode} for partner ${partnerCode}`
    super(message)
    this.name = 'PartnerQuestionNotFoundError'
  }
}

export class PartnerPricingMatrixNotFoundError extends Error {
  constructor (partnerCode: string) {
    const message: string = `Could not find partner pricing matrix with code : ${partnerCode}`
    super(message)
    this.name = '\n' +
        'export class PartnerPricingMatrixNotFoundError'
  }
}
