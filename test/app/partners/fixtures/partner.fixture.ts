import { Partner } from '../../../../src/app/partners/domain/partner'
import { OperationCode } from '../../../../src/app/common-api/domain/operation-code'

export function createPartnerFixture (attr: Partial<Partner> = {}): Partner {
  return {
    code: 'partnerOne',
    trigram: 'TRI',
    translationKey: 'translationKey',
    callbackUrl: 'http://partner1-callback.com',
    customerSupportEmail: 'customer@support.fr',
    firstQuestion: Partner.Question.QuestionCode.RoomCount,
    questions: [
      {
        code: Partner.Question.QuestionCode.RoomCount,
        toAsk: true,
        options: [
          { option: 1 },
          { option: 2 },
          { option: 3, nextStep: 'REJECT' }
        ],
        defaultNextStep: 'Address',
        defaultOption: 1
      },
      {
        code: Partner.Question.QuestionCode.Address,
        toAsk: true,
        defaultNextStep: 'SUBMIT'
      },
      {
        code: Partner.Question.QuestionCode.Roommate,
        applicable: true,
        maximumNumbers: [
          { roomCount: 1, value: 0 },
          { roomCount: 2, value: 1 },
          { roomCount: 3, value: 2 }
        ]
      }
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
