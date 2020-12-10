import { Partner } from '../../domain/partner'

export function partnerToResource (partner: Partner) {
  const questions = _toQuestions(partner.questions)

  return {
    code: partner.code,
    translation_key: partner.translationKey,
    customer_support_email: partner.customerSupportEmail,
    questions: questions
  }
}

function _toQuestions (jsonQuestions: any) {
  return jsonQuestions.reduce((questions, jsonQuestion) => {
    switch (jsonQuestion.code) {
      case Partner.Question.QuestionCode.RoomCount:
        return Object.assign(questions, _toRoomCountQuestion(jsonQuestion))
      case Partner.Question.QuestionCode.Roommate:
        return Object.assign(questions, _toRoommateQuestion(jsonQuestion))
      case Partner.Question.QuestionCode.PropertyType:
        return Object.assign(questions, _toPropertyTypeQuestion(jsonQuestion))
      case Partner.Question.QuestionCode.Occupancy:
        return Object.assign(questions, _toOccupancyQuestion(jsonQuestion))
      default:
        return questions
    }
  }, {})
}

function _toRoomCountQuestion (jsonQuestion: any) {
  return {
    room_count: {
      options: jsonQuestion.options.list,
      manage_other_cases: jsonQuestion.manageOtherCases
    }
  }
}

function _toPropertyTypeQuestion (jsonQuestion: any) {
  return {
    property_type: {
      options: jsonQuestion.options.list
    }
  }
}

function _toOccupancyQuestion (jsonQuestion: any) {
  return {
    occupancy: {
      options: jsonQuestion.options.list
    }
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
    roommate: {
      applicable: jsonQuestion.applicable,
      maximum_numbers: jsonQuestion.applicable ? _toRoomateMaximumNumbers(jsonQuestion.maximumNumbers) : undefined
    }
  }
}
