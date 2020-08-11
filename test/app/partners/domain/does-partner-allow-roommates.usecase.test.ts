import { createPartnerFixture } from '../fixtures/partner.fixture'
import { expect } from '../../../test-utils'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { PartnerNotFoundError, PartnerQuestionNotFoundError } from '../../../../src/app/partners/domain/partner.errors'
import {
  DoesPartnerAllowRoommates,
  DoesPartnerAllowRoommatesQuery
} from '../../../../src/app/partners/domain/does-partner-allow-roommates.usecase'
import { partnerRepositoryStub } from '../fixtures/partner-repository.test-doubles'
import Question = Partner.Question

describe('Partners - Usecase - Does partner allow roommates', async () => {
  it('should be true if the partner allows roommates', async () => {
    // Given
    const questions: Array<Question> = [{ code: Partner.Question.QuestionCode.Roommate, applicable: true }]
    const partner = createPartnerFixture({ questions })
    const partnerRepository = partnerRepositoryStub()
    partnerRepository.getByCode.withArgs(partner.code).resolves(partner)
    const doesPartnerAllowRoommates = DoesPartnerAllowRoommates.factory(partnerRepository)
    const query: DoesPartnerAllowRoommatesQuery = { partnerCode: partner.code }

    // When
    const partnerAllowRoommates: boolean = await doesPartnerAllowRoommates(query)

    // Then
    expect(partnerAllowRoommates).to.be.true
  })

  it('should be false if the partner does not allow roommates', async () => {
    // Given
    const questions: Array<Question> = [{ code: Partner.Question.QuestionCode.Roommate, applicable: false }]
    const partner = createPartnerFixture({ questions })
    const partnerRepository = partnerRepositoryStub()
    partnerRepository.getByCode.withArgs(partner.code).resolves(partner)
    const doesPartnerAllowRoommates = DoesPartnerAllowRoommates.factory(partnerRepository)
    const query: DoesPartnerAllowRoommatesQuery = { partnerCode: partner.code }

    // When
    const partnerAllowRoommates: boolean = await doesPartnerAllowRoommates(query)

    // Then
    expect(partnerAllowRoommates).to.be.false
  })

  it('should throw an error if partner is not found', async () => {
    // Given
    const partnerCode: string = 'partnerCode'
    const partnerRepository = partnerRepositoryStub()
    partnerRepository.getByCode.withArgs(partnerCode).rejects(new PartnerNotFoundError(partnerCode))
    const doesPartnerAllowRoommates = DoesPartnerAllowRoommates.factory(partnerRepository)
    const query: DoesPartnerAllowRoommatesQuery = { partnerCode }

    // When
    const promise = doesPartnerAllowRoommates(query)

    // When/Then
    expect(promise).to.be.rejectedWith(PartnerNotFoundError)
  })

  it('should throw an error if there is no roommate question', async () => {
    // Given
    const questions: Array<Question> = []
    const partner = createPartnerFixture({ questions })
    const partnerRepository = partnerRepositoryStub()
    partnerRepository.getByCode.withArgs(partner.code).resolves(partner)
    const doesPartnerAllowRoommates = DoesPartnerAllowRoommates.factory(partnerRepository)
    const query: DoesPartnerAllowRoommatesQuery = { partnerCode: partner.code }

    // When
    const promise = doesPartnerAllowRoommates(query)

    // When/Then
    expect(promise).to.be.rejectedWith(PartnerQuestionNotFoundError, 'Could not find partner question Roommate for partner partnerOne')
  })
})
