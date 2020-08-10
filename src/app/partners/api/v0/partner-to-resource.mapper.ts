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
      options: jsonQuestion.options.list,
      required: jsonQuestion.required
    }
  }
}

function _toRoommateQuestion (jsonQuestion: any) {
  return {
    roommate: {
      available: jsonQuestion.available
    }
  }
}
