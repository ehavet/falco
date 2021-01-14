import { Partner } from './partner'
import { PartnerQuestionNotFoundError } from './partner.errors'
import { Quote } from '../../quotes/domain/quote'
import { PropertyType } from '../../common-api/domain/type/property-type'
import { Occupancy } from '../../common-api/domain/type/occupancy'
import Question = Partner.Question;

const NUMBER_FOR_NO_ROOMMATES = 0
const DEMO_PARTNER_CODE_PREFIX: string = 'demo'

export function doesPartnerAllowRoommates (partner: Partner): boolean {
  const roommateQuestion = _getQuestion(partner, Partner.Question.QuestionCode.ROOMMATE) as Partner.Question.RoommateQuestion
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
    const roommateQuestion = _getQuestion(partner, Partner.Question.QuestionCode.ROOMMATE) as Partner.Question.RoommateQuestion
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

export function isPropertyAllowNumberOfRoommates (partner: Partner, numberOfRoommates: number, risk: Quote.Risk): boolean {
  const maxNumberOfRoommates = getMaxNumberOfRoommatesForProperty(partner, risk)
  return numberOfRoommates <= maxNumberOfRoommates
}

export function isRelatedToADemoPartner (partnerCode?: string): boolean {
  if (!partnerCode) return false
  return partnerCode.startsWith(DEMO_PARTNER_CODE_PREFIX)
}

export function isPropertyRoomCountCovered (partner: Partner, roomCount: number): boolean {
  const roomCountQuestion = partner.questions.find(question => question.code === Partner.Question.QuestionCode.ROOM_COUNT) as Partner.Question.RoomCountQuestion

  return !!roomCountQuestion.options.find(option => {
    return option.value === roomCount && option.nextStep !== Partner.Question.NextStepAction.REJECT
  })
}

function _getInsuredPropertyTypes (partner: Partner) : Array<PropertyType> {
  const propertyTypeQuestion = _getQuestion(partner, Partner.Question.QuestionCode.PROPERTY_TYPE) as Partner.Question.PropertyTypeQuestion
  if (propertyTypeQuestion.options) {
    return propertyTypeQuestion.options
      .filter(option => option.nextStep !== Partner.Question.NextStepAction.REJECT)
      .map(option => option.value)
  }
  return [propertyTypeQuestion.defaultValue]
}

function _getInsuredOccupancies (partner: Partner) : Array<Occupancy> {
  const occupancyQuestion = _getQuestion(partner, Partner.Question.QuestionCode.OCCUPANCY) as Partner.Question.OccupancyQuestion
  if (occupancyQuestion.options) {
    return occupancyQuestion.options
      .filter(option => option.nextStep !== Partner.Question.NextStepAction.REJECT)
      .map(option => option.value)
  }
  return [occupancyQuestion.defaultValue]
}

export function isPropertyTypeInsured (partner: Partner, propertyType: PropertyType | undefined): boolean {
  if (!propertyType) return false
  const insuredPropertyTypes = _getInsuredPropertyTypes(partner)
  return insuredPropertyTypes.includes(propertyType)
}

export function isOccupancyInsured (partner: Partner, occupancy: Occupancy | undefined): boolean {
  if (!occupancy) return false
  const insuredOccupancies = _getInsuredOccupancies(partner)
  return insuredOccupancies.includes(occupancy)
}

export function getDefaultPropertyType (partner: Partner) : PropertyType {
  const propertyTypeQuestion = _getQuestion(partner, Partner.Question.QuestionCode.PROPERTY_TYPE) as Partner.Question.PropertyTypeQuestion
  return propertyTypeQuestion.defaultValue
}

export function getDefaultOccupancy (partner: Partner) : Occupancy {
  const occupancyQuestion = _getQuestion(partner, Partner.Question.QuestionCode.OCCUPANCY) as Partner.Question.OccupancyQuestion
  return occupancyQuestion.defaultValue
}

function _getQuestion (partner: Partner, questionCode: Partner.Question.QuestionCode) : Question {
  return partner.questions
    .find((question) => question.code === questionCode) as Partner.Question
}
