import { Partner } from '../../domain/partner'

export function partnerToResource (partner: Partner) {
  return {
    code: partner.code,
    translation_key: partner.translationKey,
    customer_support_email: partner.customerSupportEmail,
    first_question: partner.firstQuestion,
    questions: _toQuestions(partner.questions)
  }
}

function _toQuestions (jsonQuestions: any) {
  return jsonQuestions.map((jsonQuestion) => {
    switch (jsonQuestion.code) {
      case Partner.Question.QuestionCode.RoomCount:
        return _toRoomCountQuestion(jsonQuestion)
      case Partner.Question.QuestionCode.Roommate:
        return _toRoommateQuestion(jsonQuestion)
      case Partner.Question.QuestionCode.Address:
        return _toAddressQuestion(jsonQuestion)
      default:
        return undefined
    }
  }, {})
}

function _toRoomCountQuestion (jsonQuestion: any) {
  return {
    code: jsonQuestion.code,
    options: jsonQuestion.options.map(option => ({
      value: option.value,
      next_step: option.nextStep
    })),
    to_ask: jsonQuestion.toAsk,
    default_next_step: jsonQuestion.defaultNextStep,
    default_value: jsonQuestion.defaultValue
  }
}

function _toRoommateQuestion (jsonQuestion: any) {
  function _toRoomateMaximumNumbers (maximumNumbers: any) {
    return maximumNumbers.map(maximumNumber => {
      return {
        room_count: maximumNumber.roomCount,
        value: maximumNumber.value
      }
    })
  }

  return {
    code: jsonQuestion.code,
    applicable: jsonQuestion.applicable,
    maximum_numbers: jsonQuestion.applicable ? _toRoomateMaximumNumbers(jsonQuestion.maximumNumbers) : undefined
  }
}

function _toAddressQuestion (jsonQuestion: any) {
  return {
    code: jsonQuestion.code,
    to_ask: jsonQuestion.toAsk,
    default_next_step: jsonQuestion.defaultNextStep
  }
}
