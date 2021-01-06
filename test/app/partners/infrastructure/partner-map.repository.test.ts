import { expect } from '../../../test-utils'
import { PartnerMapRepository } from '../../../../src/app/partners/infrastructure/partner-map.repository'
import { PartnerNotFoundError } from '../../../../src/app/partners/domain/partner.errors'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { OperationCode } from '../../../../src/app/common-api/domain/operation-code'
import partnerJson from './partner.json'

const expectedPartner: {partnerOne: Partner, partnerTwo: Partner} = {
  partnerOne: {
    code: 'partnerOne',
    translationKey: 'translationKey',
    trigram: 'TRI',
    callbackUrl: 'http://partner1-callback.com',
    customerSupportEmail: 'customer@support.fr',
    firstQuestion: Partner.Question.QuestionCode.PROPERTY_TYPE,
    questions: [
      {
        code: Partner.Question.QuestionCode.PROPERTY_TYPE,
        toAsk: true,
        options: [
          { value: Partner.Question.PropertyType.FLAT },
          { value: Partner.Question.PropertyType.HOUSE, nextStep: Partner.Question.NextStepAction.REJECT }
        ],
        defaultValue: Partner.Question.PropertyType.FLAT,
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS
      } as Partner.Question.PropertyTypeQuestion,
      {
        code: Partner.Question.QuestionCode.OCCUPANCY,
        toAsk: true,
        options: [
          { value: Partner.Question.Occupancy.TENANT },
          { value: Partner.Question.Occupancy.LANDLORD, nextStep: Partner.Question.NextStepAction.REJECT }
        ],
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS,
        defaultValue: Partner.Question.Occupancy.TENANT
      } as Partner.Question.OccupancyQuestion,
      {
        code: Partner.Question.QuestionCode.ROOM_COUNT,
        toAsk: true,
        options: [
          { value: 1 },
          { value: 2 },
          { value: 3, nextStep: Partner.Question.NextStepAction.REJECT }
        ],
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS,
        defaultValue: 1
      } as Partner.Question.RoomCountQuestion,
      {
        code: Partner.Question.QuestionCode.ADDRESS,
        toAsk: true,
        defaultNextStep: Partner.Question.NextStepAction.SUBMIT
      } as Partner.Question.AddressQuestion,
      {
        code: Partner.Question.QuestionCode.ROOMMATE,
        applicable: true,
        maximumNumbers: [{ roomCount: 1, value: 0 }, { roomCount: 2, value: 1 }, { roomCount: 3, value: 2 }]
      } as Partner.Question.RoommateQuestion
    ],
    offer: {
      simplifiedCovers: ['ACDDE'],
      pricingMatrix: new Map([
        [1, { monthlyPrice: 3.30, defaultDeductible: 120, defaultCeiling: 5000 }]
      ]),
      operationCodes: [OperationCode.SEMESTER1, OperationCode.FULLYEAR],
      productCode: 'APP666',
      productVersion: '1.0',
      contractualTerms: '/path/to/contractual/terms',
      ipid: '/path/to/ipid'
    }
  },
  partnerTwo: {
    code: 'partnerTwo',
    trigram: 'PAR',
    translationKey: 'translationKey',
    callbackUrl: 'http://partner2-callback.com',
    customerSupportEmail: 'customer@support.fr',
    firstQuestion: Partner.Question.QuestionCode.ROOM_COUNT,
    questions: [
      {
        code: Partner.Question.QuestionCode.PROPERTY_TYPE,
        toAsk: true,
        options: [
          { value: Partner.Question.PropertyType.FLAT },
          { value: Partner.Question.PropertyType.HOUSE, nextStep: Partner.Question.NextStepAction.REJECT }
        ],
        defaultValue: Partner.Question.PropertyType.FLAT,
        defaultNextStep: Partner.Question.QuestionCode.PROPERTY_TYPE
      },
      {
        code: Partner.Question.QuestionCode.ROOM_COUNT,
        toAsk: true,
        options: [
          { value: 1 }
        ],
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS,
        defaultValue: 1
      },
      {
        code: Partner.Question.QuestionCode.ADDRESS,
        toAsk: true,
        defaultNextStep: Partner.Question.NextStepAction.SUBMIT
      },
      {
        code: Partner.Question.QuestionCode.ROOMMATE,
        applicable: false
      }
    ],
    offer: {
      simplifiedCovers: ['ACDDE', 'ACVOL'],
      pricingMatrix: new Map([
        [1, { monthlyPrice: 4.52, defaultDeductible: 120, defaultCeiling: 5000 }],
        [2, { monthlyPrice: 6.95, defaultDeductible: 150, defaultCeiling: 7000 }]
      ]),
      operationCodes: [OperationCode.SEMESTER2, OperationCode.FULLYEAR],
      productCode: 'MRH_Etudiant',
      productVersion: '1.0',
      contractualTerms: '/path/to/contractual/terms',
      ipid: '/path/to/ipid'
    }
  }
}

describe('Partners - Infra - Partner Map Repository', async () => {
  let partnerMapRepository: PartnerRepository

  beforeEach(() => {
    partnerMapRepository = new PartnerMapRepository(partnerJson)
  })

  describe('#getByCode', async () => {
    it('should return partner by partner code', async () => {
      // WHEN
      const partner: Partner = await partnerMapRepository.getByCode('partnerOne')

      // THEN
      expect(partner).to.deep.equal(expectedPartner.partnerOne)
    })

    it('should thrown not found error when partner is not found', async () => {
      // WHEN
      const promise: Promise<Partner> = partnerMapRepository.getByCode('unkownPartnerCode')

      // THEN
      return expect(promise).to.be.rejectedWith(PartnerNotFoundError)
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
        defaultDeductible: 120,
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
