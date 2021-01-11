import { Partner } from './partner'
import { PartnerQuestionNotFoundError } from './partner.errors'
import { Quote } from '../../quotes/domain/quote'
import { PropertyType } from '../../common-api/domain/type/property-type'

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
    .find((question) => question.code === Partner.Question.QuestionCode.PROPERTY_TYPE) as Partner.Question.PropertyTypeQuestion
}

function _getInsuredPropertyTypes (partner: Partner) : Array<PropertyType> {
  const propertyTypeQuestion = _getQuestionOnPropertyType(partner)
  if (propertyTypeQuestion.options) {
    return propertyTypeQuestion.options
      .filter(option => option.nextStep !== Partner.Question.NextStepAction.REJECT)
      .map(option => option.value)
  }
  return [propertyTypeQuestion.defaultValue]
}

export function isPropertyTypeInsured (partner: Partner, propertyType: PropertyType | undefined): boolean {
  if (!propertyType) return false
  const insuredPropertyTypes = _getInsuredPropertyTypes(partner)
  return insuredPropertyTypes.includes(propertyType)
}
