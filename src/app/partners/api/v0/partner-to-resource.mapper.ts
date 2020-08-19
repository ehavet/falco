import { Partner } from '../../domain/partner'

export function partnerToResource (partner: Partner) {
  const questions = _toQuestions(partner.questions)

  return {
    code: partner.code,
    translation_key: partner.translationKey,
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
      default:
        return questions
    }
  }, {})
}

function _toRoomCountQuestion (jsonQuestion: any) {
  return {
    room_count: {
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
