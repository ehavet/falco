import { Partner } from '../domain/partner'
import { Quote } from '../../quotes/domain/quote'
import RoomCount = Partner.RoomCount

function _toOffer (offer: any) : Partner.Offer {
  if (offer === undefined) {
    return {
      simplifiedCovers: [],
      pricingMatrix: new Map<RoomCount, Quote.Insurance.Estimate>(),
      productCode: '',
      productVersion: '',
      contractualTerms: '',
      ipid: '',
      operationalCodes: []
    }
  }
  return {
    simplifiedCovers: offer.simplifiedCovers,
    pricingMatrix: new Map<RoomCount, Quote.Insurance.Estimate>(offer.pricingMatrix),
    productCode: offer.productCode,
    productVersion: offer.productVersion,
    contractualTerms: offer.contractualTerms,
    ipid: offer.ipid,
    operationalCodes: offer.operationalCodes
  }
}

export function toPartner (partnerJson: any) : Partner {
  const questions : Array<Partner.Question> = _toQuestions(partnerJson.questions)
  const offer: Partner.Offer = _toOffer(partnerJson.offer)

  return {
    code: partnerJson.code,
    translationKey: partnerJson.translationKey,
    callbackUrl: partnerJson.callbackUrl,
    questions: questions,
    offer: offer
  }
}

function _toQuestions (questions: any) {
  return questions.map(jsonQuestion => {
    switch (jsonQuestion.code) {
      case Partner.Question.QuestionCode.RoomCount:
        return _toRoomCountQuestion(jsonQuestion)
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
    required: jsonQuestion.required
  }

  return question
}
