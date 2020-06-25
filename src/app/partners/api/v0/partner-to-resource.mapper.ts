import { Partner, QuestionCode } from '../../domain/partner'

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
      case QuestionCode.RoomCount:
        return Object.assign(questions, _toRoomCountQuestion(jsonQuestion))
      default:
        return questions
    }
  }, {})
}

function _toRoomCountQuestion (jsonQuestion: any) {
  const roomCountQuestion = {
    room_count: {
      options: jsonQuestion.options.list,
      required: jsonQuestion.required
    }
  }

  return roomCountQuestion
}
