import { Partner } from '../../../../src/app/partners/domain/partner'
import { OperationCode } from '../../../../src/app/common-api/domain/operation-code'

export function createPartnerFixture (attr: Partial<Partner> = {}): Partner {
  return {
    code: 'partnerOne',
    trigram: 'TRI',
    translationKey: 'translationKey',
    callbackUrl: 'http://partner1-callback.com',
    customerSupportEmail: 'customer@support.fr',
    firstQuestion: Partner.Question.QuestionCode.PropertyType,
    questions: [
      {
        code: Partner.Question.QuestionCode.PropertyType,
        toAsk: true,
        options: [
          { value: Partner.Question.PropertyType.FLAT },
          { value: Partner.Question.PropertyType.HOUSE, nextStep: Partner.Question.NextStepAction.REJECT }
        ],
        defaultValue: Partner.Question.PropertyType.FLAT,
        defaultNextStep: Partner.Question.QuestionCode.Address
      } as Partner.Question.PropertyTypeQuestion,
      {
        code: Partner.Question.QuestionCode.RoomCount,
        toAsk: true,
        options: [
          { value: 1 },
          { value: 2 },
          { value: 3, nextStep: Partner.Question.NextStepAction.REJECT }
        ],
        defaultNextStep: Partner.Question.QuestionCode.Address,
        defaultValue: 1
      } as Partner.Question.RoomCountQuestion,
      {
        code: Partner.Question.QuestionCode.Address,
        toAsk: true,
        defaultNextStep: Partner.Question.NextStepAction.SUBMIT
      } as Partner.Question.AddressQuestion,
      {
        code: Partner.Question.QuestionCode.Roommate,
        applicable: true,
        maximumNumbers: [
          { roomCount: 1, value: 0 },
          { roomCount: 2, value: 1 },
          { roomCount: 3, value: 2 }
        ]
      } as Partner.Question.RoommateQuestion
    ],
    offer: {
      simplifiedCovers: ['ACDDE'],
      pricingMatrix: new Map([
        [1, { monthlyPrice: 3.30, defaultDeductible: 120, defaultCeiling: 5000 }]
      ]),
      productCode: 'APP666',
      productVersion: '1.0',
      contractualTerms: '/path/to/contractual/terms',
      ipid: '/path/to/ipid',
      operationCodes: [OperationCode.SEMESTER1, OperationCode.FULLYEAR]
    },
    ...attr
  }
}
