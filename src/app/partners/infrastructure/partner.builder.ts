import { Partner } from '../domain/partner'
import { PricingMatrixSqlModel } from './sql-models/pricing-matrix-sql.model'
import { Amount } from '../../common-api/domain/amount/amount'
import RoomCount = Partner.RoomCount

export async function buildPartner (partnerJson: any, pricingMatrixSql: PricingMatrixSqlModel[]) : Promise<Partner> {
  const questions : Array<Partner.Question> = _toQuestions(partnerJson.questions)
  const offer: Partner.Offer = _toOffer(partnerJson.offer, pricingMatrixSql)

  return {
    code: partnerJson.code,
    trigram: partnerJson.trigram,
    translationKey: partnerJson.translationKey,
    callbackUrl: partnerJson.callbackUrl,
    customerSupportEmail: partnerJson.customerSupportEmail,
    firstQuestion: partnerJson.firstQuestion,
    questions: questions,
    offer: offer
  }
}

function _toQuestions (questions: any) {
  return questions.map(jsonQuestion => {
    switch (jsonQuestion.code) {
      case Partner.Question.QuestionCode.ROOM_COUNT:
        return _toRoomCountQuestion(jsonQuestion)
      case Partner.Question.QuestionCode.ROOMMATE:
        return _toRoommateQuestion(jsonQuestion)
      case Partner.Question.QuestionCode.ADDRESS:
        return _toAddressQuestion(jsonQuestion)
      case Partner.Question.QuestionCode.PROPERTY_TYPE:
        return _toPropertyTypeQuestion(jsonQuestion)
      case Partner.Question.QuestionCode.OCCUPANCY:
        return _toOccupancyQuestion(jsonQuestion)
      default:
        return undefined
    }
  })
}

function _toRoomCountQuestion (jsonQuestion: any) {
  const question: Partner.Question.RoomCountQuestion = {
    code: Partner.Question.QuestionCode.ROOM_COUNT,
    options: jsonQuestion.options,
    toAsk: jsonQuestion.toAsk,
    defaultNextStep: jsonQuestion.defaultNextStep,
    defaultValue: jsonQuestion.defaultValue
  }

  return question
}

function _toOccupancyQuestion (jsonQuestion: any) {
  const question: Partner.Question.OccupancyQuestion = {
    code: Partner.Question.QuestionCode.OCCUPANCY,
    options: jsonQuestion.options,
    toAsk: jsonQuestion.toAsk,
    defaultNextStep: jsonQuestion.defaultNextStep,
    defaultValue: jsonQuestion.defaultValue
  }

  return question
}

function _toRoommateQuestion (jsonQuestion: any) {
  const question: Partner.Question.RoommateQuestion = {
    code: Partner.Question.QuestionCode.ROOMMATE,
    applicable: jsonQuestion.applicable,
    maximumNumbers: jsonQuestion.maximumNumbers
  }

  return question
}

function _toAddressQuestion (jsonQuestion: any) {
  const question: Partner.Question.AddressQuestion = {
    code: Partner.Question.QuestionCode.ADDRESS,
    toAsk: jsonQuestion.toAsk,
    defaultNextStep: jsonQuestion.defaultNextStep
  }
  return question
}

function _toPropertyTypeQuestion (jsonQuestion: any) {
  const question: Partner.Question.PropertyTypeQuestion = {
    code: Partner.Question.QuestionCode.PROPERTY_TYPE,
    toAsk: jsonQuestion.toAsk,
    options: jsonQuestion.options,
    defaultValue: jsonQuestion.defaultValue,
    defaultNextStep: jsonQuestion.defaultNextStep
  }
  return question
}

function _toOffer (offer: any, pricingMatrixArray: PricingMatrixSqlModel[]) : Partner.Offer {
  if (offer === undefined) {
    return {
      simplifiedCovers: [],
      pricingMatrix: new Map<RoomCount, Partner.Estimate>(),
      productCode: '',
      productVersion: '',
      contractualTerms: '',
      ipid: '',
      operationCodes: []
    }
  }

  return {
    simplifiedCovers: offer.simplifiedCovers,
    pricingMatrix: buildPricingMatrix(offer.defaultDeductible, pricingMatrixArray),
    productCode: offer.productCode,
    productVersion: offer.productVersion,
    contractualTerms: offer.contractualTerms,
    ipid: offer.ipid,
    operationCodes: offer.operationCodes
  }
}

function buildPricingMatrix (
  defaultDeductible: number,
  pricingMatrixArray: PricingMatrixSqlModel[]
) : Map<RoomCount, Partner.Estimate> {
  const offerWithMonthlyPrice: Array<Array<RoomCount | Partner.Estimate>> = pricingMatrixArray.map(pricingLine => {
    const roomCount = pricingLine.roomCount
    return [roomCount, { monthlyPrice: Amount.toAmount(pricingLine.coverMonthlyPrice), defaultDeductible: defaultDeductible }]
  })

  // @ts-ignore
  return new Map<RoomCount, Partner.Estimate>(offerWithMonthlyPrice)
}
