import { Partner } from './partner'
import { PartnerQuestionNotFoundError } from './partner.errors'
import { Quote } from '../../quotes/domain/quote'
import { PropertyType } from '../../common-api/domain/common-type/property-type'

const NUMBER_FOR_NO_ROOMMATES = 0
const DEMO_PARTNER_CODE_PREFIX: string = 'demo'

export function doesPartnerAllowRoommates (partner: Partner): boolean {
  const roommateQuestion = _getQuestionOnRoommates(partner)
  if (roommateQuestion) {
    return (roommateQuestion as Partner.Question.RoommateQuestion).applicable
  }
  throw new PartnerQuestionNotFoundError(partner.code, Partner.Question.QuestionCode.ROOMMATE)
}

export function doesPartnerAllowNumberOfRoommatesForProperty (partner: Partner, numberOfRoommates: number, risk: Quote.Risk): boolean {
  if (doesPartnerAllowRoommates(partner)) {
    const maxNumberOfRoommates = getMaxNumberOfRoommatesForProperty(partner, risk)
    return numberOfRoommates <= maxNumberOfRoommates
  }
  return false
}

export function getMaxNumberOfRoommatesForProperty (partner: Partner, risk: Quote.Risk): number {
  if (doesPartnerAllowRoommates(partner)) {
    const roomCount: number = risk.property.roomCount
    const roommateQuestion = _getQuestionOnRoommates(partner)
    const maxNumberOfRoommates = (roommateQuestion as Partner.Question.RoommateQuestion).maximumNumbers!.find(maximumNumber => maximumNumber.roomCount === roomCount)
    return maxNumberOfRoommates ? maxNumberOfRoommates.value : NUMBER_FOR_NO_ROOMMATES
  }
  return NUMBER_FOR_NO_ROOMMATES
}

export function getProductCode (partner: Partner): string {
  return partner.offer.productCode
}

export function getTrigram (partner: Partner): string {
  return partner.trigram
}

function _getQuestionOnRoommates (partner: Partner) {
  const roommateQuestion: Partner.Question | undefined = partner.questions
    .find(question => question.code === Partner.Question.QuestionCode.ROOMMATE)
  return roommateQuestion
}

export function isPropertyRoomCountCovered (partner: Partner, propertyRoomCount): boolean {
  return !!partner.offer.pricingMatrix.get(propertyRoomCount)
}

export function isPropertyAllowNumberOfRoommates (partner: Partner, numberOfRoommates: number, risk: Quote.Risk): boolean {
  const maxNumberOfRoommates = getMaxNumberOfRoommatesForProperty(partner, risk)
  return numberOfRoommates <= maxNumberOfRoommates
}

export function isRelatedToADemoPartner (partnerCode?: string): boolean {
  if (!partnerCode) return false
  return partnerCode.startsWith(DEMO_PARTNER_CODE_PREFIX)
}

function _getQuestionOnPropertyType (partner: Partner) : Partner.Question.PropertyTypeQuestion {
  return partner.questions
    .find((question) => question.code === Partner.Question.QuestionCode.PropertyType) as Partner.Question.PropertyTypeQuestion
}

function _getMatchingOption (options: Array<Partner.Question.Option<PropertyType>>, type: string) : Partner.Question.Option<PropertyType> | undefined {
  return options.find(option => option.value === type)
}

export function isValidPropertyType (partner: Partner, type: PropertyType): boolean {
  const question = _getQuestionOnPropertyType(partner)

  if (!question.options) {
    return type === question.defaultValue
  }

  const matchingOption = _getMatchingOption(question.options, type)
  if (!matchingOption?.nextStep) return true

  return matchingOption?.nextStep !== Partner.Question.NextStepAction.REJECT
}
