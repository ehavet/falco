import { Partner } from './partner'
import { PartnerQuestionNotFoundError } from './partner.errors'

export function doesPartnerAllowRoommates (partner: Partner): boolean {
  const roommateQuestion: Partner.Question | undefined = partner.questions
    .find(question => question.code === Partner.Question.QuestionCode.Roommate)
  if (roommateQuestion) {
    return (roommateQuestion as Partner.Question.RoommateQuestion).applicable
  }
  throw new PartnerQuestionNotFoundError(partner.code, Partner.Question.QuestionCode.Roommate)
}

export function getProductCode (partner: Partner): string {
  return partner.offer.productCode
}
