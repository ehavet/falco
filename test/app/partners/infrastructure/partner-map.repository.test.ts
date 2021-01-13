import { expect } from '../../../test-utils'
import { PartnerMapRepository } from '../../../../src/app/partners/infrastructure/partner-map.repository'
import { PartnerNotFoundError } from '../../../../src/app/partners/domain/partner.errors'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { OperationCode } from '../../../../src/app/common-api/domain/operation-code'
import partnerJson from './partner.json'
import { Occupancy } from '../../../../src/app/common-api/domain/type/occupancy'
import { PropertyType } from '../../../../src/app/common-api/domain/type/property-type'

const expectedPartner: { partnerOne: Partner } = {
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
          { value: PropertyType.FLAT },
          { value: PropertyType.HOUSE, nextStep: Partner.Question.NextStepAction.REJECT }
        ],
        defaultValue: PropertyType.FLAT,
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS
      } as Partner.Question.PropertyTypeQuestion,
      {
        code: Partner.Question.QuestionCode.OCCUPANCY,
        toAsk: true,
        options: [
          { value: Occupancy.TENANT },
          { value: Occupancy.LANDLORD, nextStep: Partner.Question.NextStepAction.REJECT }
        ],
        defaultNextStep: Partner.Question.QuestionCode.ADDRESS,
        defaultValue: Occupancy.TENANT
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
      defaultDeductible: 120,
      operationCodes: [OperationCode.SEMESTER1, OperationCode.FULLYEAR],
      productCode: 'APP666',
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
