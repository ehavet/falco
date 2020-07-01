import { expect } from '../../../test-utils'
import { PartnerMapRepository } from '../../../../src/app/partners/infrastructure/partner-map.repository'
import { PartnerNotFoundError } from '../../../../src/app/partners/domain/partner.errors'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { Quote } from '../../../../src/app/quotes/domain/quote'

const partnerJson = {
  partnerOne: {
    code: 'partnerOne',
    translationKey: 'translationKey',
    questions: [
      {
        code: Partner.Question.QuestionCode.RoomCount,
        options: {
          list: [1, 2, 3]
        },
        required: true
      }
    ],
    offer: {
      simplifiedCovers: ['ACDDE'],
      pricingMatrix: [
        [1, { monthlyPrice: 3.30, defaultDeductible: 120, defaultCeiling: 5000 }]
      ],
      productCode: 'MRH_Etudiant',
      productVersion: '1.0'
    }
  },
  partnerTwo: {
    code: 'partnerTwo',
    translationKey: 'translationKey',
    questions: [
      {
        code: Partner.Question.QuestionCode.RoomCount,
        options: {
          list: [1]
        },
        required: true
      }
    ],
    offer: {
      simplifiedCovers: ['ACDDE', 'ACVOL'],
      pricingMatrix: [
        [1, { monthlyPrice: 4.52, defaultDeductible: 120, defaultCeiling: 5000 }],
        [2, { monthlyPrice: 6.95, defaultDeductible: 150, defaultCeiling: 7000 }]
      ],
      productCode: 'MRH_Etudiant',
      productVersion: '1.0'
    }
  }
}

const partnerMapRepository = new PartnerMapRepository(partnerJson)

describe('Partner Map Repository', async () => {
  describe('#getByCode', async () => {
    it('should return partner by partner code', async () => {
      // WHEN
      const partner: Partner = await partnerMapRepository.getByCode('partnerOne')

      // THEN
      expect(partner).to.deep.equal(
        {
          code: 'partnerOne',
          translationKey: 'translationKey',
          questions: [
            {
              code: Partner.Question.QuestionCode.RoomCount,
              options: {
                list: [1, 2, 3]
              },
              required: true
            }
          ],
          offer: {
            simplifiedCovers: ['ACDDE'],
            pricingMatrix: new Map([
              [1, { monthlyPrice: 3.30, defaultDeductible: 120, defaultCeiling: 5000 }]
            ]),
            productCode: 'MRH_Etudiant',
            productVersion: '1.0'
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
      expect(partnerOffer.simplifiedCovers).to.include('ACDDE', 'ACVOL')
      expect(partnerOffer.pricingMatrix.get(1)).to.deep.equal(propertyRoomCount1Estimate)
      expect(partnerOffer.pricingMatrix.get(2)).to.deep.equal(propertyRoomCount2Estimate)
    })
  })
})
