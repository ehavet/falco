import { expect } from '../../../test-utils'
import { PartnerMapRepository } from '../../../../src/app/partners/infrastructure/partner-map.repository'
import { PartnerNotFoundError } from '../../../../src/app/partners/domain/partner.errors'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { OperationCode } from '../../../../src/app/pricing/domain/operation-code'

const partnerJson = {
  partnerOne: {
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
      pricingMatrix: [
        [1, { monthlyPrice: 3.30, defaultDeductible: 120, defaultCeiling: 5000 }]
      ],
      operationCodes: ['SEMESTER1', 'FULLYEAR'],
      productCode: 'MRH_Etudiant',
      productVersion: '1.0',
      contractualTerms: '/path/to/contractual/terms',
      ipid: '/path/to/ipid'
    }
  },
  partnerTwo: {
    code: 'partnerTwo',
    translationKey: 'translationKey',
    callbackUrl: 'http://partner2-callback.com',
    questions: [
      {
        code: Partner.Question.QuestionCode.RoomCount,
        options: {
          list: [1]
        }
      },
      {
        code: Partner.Question.QuestionCode.Roommate,
        applicable: true
      }
    ],
    offer: {
      simplifiedCovers: ['ACDDE', 'ACVOL'],
      pricingMatrix: [
        [1, { monthlyPrice: 4.52, defaultDeductible: 120, defaultCeiling: 5000 }],
        [2, { monthlyPrice: 6.95, defaultDeductible: 150, defaultCeiling: 7000 }]
      ],
      operationCodes: ['SEMESTER2', 'FULLYEAR'],
      productCode: 'MRH_Etudiant',
      productVersion: '1.0',
      contractualTerms: '/path/to/contractual/terms',
      ipid: '/path/to/ipid'
    }
  }
}

describe('Partner Map Repository', async () => {
  let partnerMapRepository: PartnerRepository

  beforeEach(() => {
    partnerMapRepository = new PartnerMapRepository(partnerJson)
  })

  describe('#getByCode', async () => {
    it('should return partner by partner code', async () => {
      // WHEN
      const partner: Partner = await partnerMapRepository.getByCode('partnerOne')

      // THEN
      expect(partner).to.deep.equal(
        {
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
            operationCodes: ['SEMESTER1', 'FULLYEAR']
          }
        })
    })

    it('should thrown not found error when partner is not found', async () => {
      // WHEN
      const partnerPromise: Promise<Partner> = partnerMapRepository.getByCode('unkownPartnerCode')

      // THEN
      expect(partnerPromise).to.be.rejectedWith(PartnerNotFoundError)
    })
  })

  describe('#getOffer', async () => {
    it('should return the partner offer', async () => {
      // Given
      const propertyRoomCount1Estimate: Quote.Insurance.Estimate = {
        monthlyPrice: 4.52,
        defaultDeductible: 120,
        defaultCeiling: 5000
      }

      const propertyRoomCount2Estimate: Quote.Insurance.Estimate = {
        monthlyPrice: 6.95,
        defaultDeductible: 150,
        defaultCeiling: 7000
      }

      // When
      const partnerOffer: Partner.Offer = await partnerMapRepository.getOffer('partnerTwo')

      // Then
      expect(partnerOffer.simplifiedCovers).to.include('ACDDE', 'ACVOL')
      expect(partnerOffer.productCode).to.equal('MRH_Etudiant')
      expect(partnerOffer.productVersion).to.equal('1.0')
      expect(partnerOffer.contractualTerms).to.equal('/path/to/contractual/terms')
      expect(partnerOffer.ipid).to.equal('/path/to/ipid')
      expect(partnerOffer.simplifiedCovers).to.include('ACDDE', 'ACVOL')
      expect(partnerOffer.pricingMatrix.get(1)).to.deep.equal(propertyRoomCount1Estimate)
      expect(partnerOffer.pricingMatrix.get(2)).to.deep.equal(propertyRoomCount2Estimate)
    })
  })

  describe('#getCallbackUrl', async () => {
    it('should return the partner callback url', async () => {
      // When
      const callbackUrl: string = await partnerMapRepository.getCallbackUrl('partnerTwo')

      // Then
      expect(callbackUrl).to.equal('http://partner2-callback.com')
    })

    it('should throw an error if partner does not exist', async () => {
      // When
      const promise = partnerMapRepository.getCallbackUrl('unknownPartner')

      // Then
      return expect(promise).to.be.rejectedWith(PartnerNotFoundError)
    })
  })

  describe('#getOperationCodes', async () => {
    it('should return the partner available operation codes', async () => {
      // When
      const operationCodes: Array<OperationCode> = await partnerMapRepository.getOperationCodes('partnerTwo')

      // Then
      expect(operationCodes).to.deep.equal([
        OperationCode.SEMESTER2,
        OperationCode.FULLYEAR
      ])
    })

    it('should throw an error if partner does not exist', async () => {
      // When
      const promise = partnerMapRepository.getOperationCodes('unknownPartner')

      // Then
      return expect(promise).to.be.rejectedWith(PartnerNotFoundError)
    })
  })
})
