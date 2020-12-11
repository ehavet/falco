import { Partner } from '../domain/partner'
import { Quote } from '../../quotes/domain/quote'
import RoomCount = Partner.RoomCount

export function toPartner (partnerJson: any) : Partner {
  const questions : Array<Partner.Question> = _toQuestions(partnerJson.questions)
  const offer: Partner.Offer = _toOffer(partnerJson.offer)

  return {
    code: partnerJson.code,
    trigram: partnerJson.trigram,
    translationKey: partnerJson.translationKey,
    callbackUrl: partnerJson.callbackUrl,
    customerSupportEmail: partnerJson.customerSupportEmail,
    questions: questions,
    offer: offer
  }
}

function _toQuestions (questions: any) {
  return questions.map(jsonQuestion => {
    switch (jsonQuestion.code) {
      case Partner.Question.QuestionCode.RoomCount:
        return _toRoomCountQuestion(jsonQuestion)
      case Partner.Question.QuestionCode.Roommate:
        return _toRoommateQuestion(jsonQuestion)
      case Partner.Question.QuestionCode.PropertyType:
        return _toPropertyTypeQuestion(jsonQuestion)
      case Partner.Question.QuestionCode.Occupancy:
        return _toOccupancyQuestion(jsonQuestion)
      default:
        return undefined
    }
  })
}

function _toRoomCountQuestion (jsonQuestion: any) {
  const question: Partner.Question.RoomCountQuestion = {
    code: Partner.Question.QuestionCode.RoomCount,
    options: {
      list: jsonQuestion.options.list
    },
    manageOtherCases: jsonQuestion.manageOtherCases
  }

  return question
}

function _toPropertyTypeQuestion (jsonQuestion: any) {
  const question: Partner.Question.PropertyTypeQuestion = {
    code: Partner.Question.QuestionCode.PropertyType,
    options: jsonQuestion.options
  }
  return question
}

function _toOccupancyQuestion (jsonQuestion: any) {
  const question: Partner.Question.OccupancyQuestion = {
    code: Partner.Question.QuestionCode.Occupancy,
    options: jsonQuestion.options
  }
  return question
}

function _toRoommateQuestion (jsonQuestion: any) {
  const question: Partner.Question.RoommateQuestion = {
    code: Partner.Question.QuestionCode.Roommate,
    applicable: jsonQuestion.applicable,
    maximumNumbers: jsonQuestion.maximumNumbers
  }

  return question
}

function _toOffer (offer: any) : Partner.Offer {
  if (offer === undefined) {
    return {
      simplifiedCovers: [],
      pricingMatrix: new Map<RoomCount, Quote.Insurance.Estimate>(),
      productCode: '',
      productVersion: '',
      contractualTerms: '',
      ipid: '',
      operationCodes: []
    }
  }
  return {
    simplifiedCovers: offer.simplifiedCovers,
    pricingMatrix: new Map<RoomCount, Quote.Insurance.Estimate>(offer.pricingMatrix),
    productCode: offer.productCode,
    productVersion: offer.productVersion,
    contractualTerms: offer.contractualTerms,
    ipid: offer.ipid,
    operationCodes: offer.operationCodes
  }
}
