import { expect } from '../../../test-utils'
import * as PartnerFunc from '../../../../src/app/partners/domain/partner.func'
import { createPartnerFixture } from '../fixtures/partner.fixture'
import { Partner } from '../../../../src/app/partners/domain/partner'
import Question = Partner.Question

describe('Partners - Domain - Functions', () => {
  describe('#doesPartnerAllowNumberOfRoommatesForProperty', () => {
    it('should return true if the number of roommates equals the number max of roommates allowed for the given room count', () => {
      const questions: Array<Question> = [{
        code: Partner.Question.QuestionCode.ROOMMATE,
        applicable: true,
        maximumNumbers: [{ roomCount: 2, value: 2 }]
      }]

      const partner = createPartnerFixture({ questions })

      // When
      const allowNumberOfRoommates = PartnerFunc.doesPartnerAllowNumberOfRoommatesForProperty(partner, 2, { property: { roomCount: 2 } })

      // Then
      expect(allowNumberOfRoommates).to.be.true
    })

    it('should return true if the number of roommates is less than the number max of roommates allowed for the given room count', () => {
      const questions: Array<Question> = [{
        code: Partner.Question.QuestionCode.ROOMMATE,
        applicable: true,
        maximumNumbers: [{ roomCount: 2, value: 2 }]
      }]

      const partner = createPartnerFixture({ questions })

      // When
      const allowNumberOfRoommates = PartnerFunc.doesPartnerAllowNumberOfRoommatesForProperty(partner, 1, { property: { roomCount: 2 } })

      // Then
      expect(allowNumberOfRoommates).to.be.true
    })

    it('should return false if there are too many roommates for the given room count', () => {
      const questions: Array<Question> = [{
        code: Partner.Question.QuestionCode.ROOMMATE,
        applicable: true,
        maximumNumbers: [{ roomCount: 2, value: 2 }]
      }]

      const partner = createPartnerFixture({ questions })

      // When
      const allowNumberOfRoommates = PartnerFunc.doesPartnerAllowNumberOfRoommatesForProperty(partner, 3, { property: { roomCount: 2 } })

      // Then
      expect(allowNumberOfRoommates).to.be.false
    })

    it('should return false if there are roommates but the partner does not allow roommates', () => {
      const questions: Array<Question> = [{
        code: Partner.Question.QuestionCode.ROOMMATE,
        applicable: false,
        maximumNumbers: [{ roomCount: 2, value: 2 }]
      }]

      const partner = createPartnerFixture({ questions })

      // When
      const allowNumberOfRoommates = PartnerFunc.doesPartnerAllowNumberOfRoommatesForProperty(partner, 2, { property: { roomCount: 2 } })

      // Then
      expect(allowNumberOfRoommates).to.be.false
    })
  })

  describe('isRelatedToDemoPartners', async () => {
    it('Should return true if the partner names start with demo', () => {
      const demoPartnerNames = ['demo', 'demo-student', 'demostudent']
      demoPartnerNames.forEach((demoPartnerName) => {
        expect(PartnerFunc.isRelatedToADemoPartner(demoPartnerName)).to.be.true
      })
    })

    describe('Should return false if', () => {
      it('the partner names dont start with demo', () => {
        const demoPartnerNames = ['dem', 'essca', 'estudent']
        demoPartnerNames.forEach((demoPartnerName) => {
          expect(PartnerFunc.isRelatedToADemoPartner(demoPartnerName)).to.be.false
        })
      })

      it('the partner names is undefined', () => {
        expect(PartnerFunc.isRelatedToADemoPartner(undefined)).to.be.false
      })
    })
  })
})
