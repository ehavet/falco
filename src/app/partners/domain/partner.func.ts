import { Partner } from './partner'
import { PartnerQuestionNotFoundError } from './partner.errors'
import { Quote } from '../../quotes/domain/quote'

export function doesPartnerAllowRoommates (partner: Partner): boolean {
  const roommateQuestion: Partner.Question | undefined = partner.questions
    .find(question => question.code === Partner.Question.QuestionCode.Roommate)
  if (roommateQuestion) {
    return (roommateQuestion as Partner.Question.RoommateQuestion).applicable
  }
  throw new PartnerQuestionNotFoundError(partner.code, Partner.Question.QuestionCode.Roommate)
}

export function doesPartnerAllowThisNumberOfRoommates (partner: Partner, numberOfRoommates: number, risk: Quote.Risk): boolean {
  if (doesPartnerAllowRoommates(partner)) {
    const roomCount: number = risk.property.roomCount
    const roommateQuestion: Partner.Question | undefined = partner.questions
      .find(question => question.code === Partner.Question.QuestionCode.Roommate)
    const maximumNumberOfRoommates = (roommateQuestion as Partner.Question.RoommateQuestion).maximumNumbers!.find(maximumNumber => maximumNumber.roomCount === roomCount)
    return !!maximumNumberOfRoommates && (maximumNumberOfRoommates.value === numberOfRoommates)
  }
  return false
}

export function getProductCode (partner: Partner): string {
  return partner.offer.productCode
}
