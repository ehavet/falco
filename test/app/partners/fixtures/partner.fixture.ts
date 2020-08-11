import { Partner } from '../../../../src/app/partners/domain/partner'
import { OperationCode } from '../../../../src/app/policies/domain/operation-code'

export function createPartnerFixture (attr: Partial<Partner> = {}): Partner {
  return {
    code: 'partnerOne',
    translationKey: 'translationKey',
    callbackUrl: 'http://partner1-callback.com',
    questions: [
      {
        code: Partner.Question.QuestionCode.RoomCount,
        options: {
          list: [1, 2, 3]
        }
      },
      {
        code: Partner.Question.QuestionCode.Roommate,
        applicable: false
      }
    ],
    offer: {
      simplifiedCovers: ['ACDDE'],
      pricingMatrix: new Map([
        [1, { monthlyPrice: 3.30, defaultDeductible: 120, defaultCeiling: 5000 }]
      ]),
      productCode: 'MRH_Etudiant',
      productVersion: '1.0',
      contractualTerms: '/path/to/contractual/terms',
      ipid: '/path/to/ipid',
      operationCodes: [OperationCode.SEMESTER1, OperationCode.FULLYEAR]
    },
    ...attr
  }
}
