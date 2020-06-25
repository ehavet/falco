import { Partner, Question, QuestionCode, RoomCountQuestion } from '../domain/partner'

export function toPartner (partnerJson: any) : Partner {
  const questions : Array<Question> = _toQuestions(partnerJson.questions)

  return {
    code: partnerJson.code,
    translationKey: partnerJson.translationKey,
    questions: questions
  }
}

function _toQuestions (questions: any) {
  return questions.map(jsonQuestion => {
    switch (jsonQuestion.code) {
      case QuestionCode.RoomCount:
        return _toRoomCountQuestion(jsonQuestion)
      default:
        return undefined
    }
  })
}

function _toRoomCountQuestion (jsonQuestion: any) {
  const question: RoomCountQuestion = {
    code: QuestionCode.RoomCount,
    options: {
      list: jsonQuestion.options.list
    },
    required: jsonQuestion.required
  }

  return question
}
