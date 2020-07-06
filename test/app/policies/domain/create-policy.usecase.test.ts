import { Policy } from '../../../../src/app/policies/domain/policy'
import { CreatePolicyCommand } from '../../../../src/app/policies/domain/create-policy-command'
import { dateFaker, expect, sinon } from '../../../test-utils'
import { CreatePolicy } from '../../../../src/app/policies/domain/create-policy.usecase'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { QuoteRepository } from '../../../../src/app/quotes/domain/quote.repository'
import { SinonStubbedInstance } from 'sinon'
import { createQuote } from '../../quotes/fixtures/quote.fixture'
import { createCreatePolicyCommand } from '../fixtures/createPolicyCommand.fixture'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { createOngoingPolicyFixture } from '../fixtures/policy.fixture'

describe('Policies - Usecase - Create policy', async () => {
  const now = new Date('2020-01-05T10:09:08Z')
  const quote: Quote = createQuote()
  const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quote.id, startDate: null })
  const policyRepository: SinonStubbedInstance<PolicyRepository> = { save: sinon.stub(), isIdAvailable: sinon.stub() }
  policyRepository.isIdAvailable.resolves(true)
  const quoteRepository: SinonStubbedInstance<QuoteRepository> = { save: sinon.stub(), get: sinon.stub() }
  const createPolicy: CreatePolicy = CreatePolicy.factory(policyRepository, quoteRepository)

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
  })

  it('should save the created policy', async () => {
    // Given
    const expectedPolicy = createOngoingPolicyFixture()
    quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)
    policyRepository.save.resolves(expectedPolicy)

    // When
    await createPolicy(createPolicyCommand)

    // Then
    const saveSpy = policyRepository.save.getCall(0)
    expectedPolicy.id = saveSpy.args[0].id
    expectedPolicy.termEndDate = saveSpy.args[0].termEndDate
    return expect(saveSpy).to.have.been.calledWith(expectedPolicy)
  })

  it('should return the newly create policy', async () => {
    // Given
    const expectedPolicy = createOngoingPolicyFixture()
    quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)
    policyRepository.save.resolves(expectedPolicy)

    // When
    const createdPolicy: Policy = await createPolicy(createPolicyCommand)

    // Then
    expect(createdPolicy).to.deep.equal(expectedPolicy)
  })
})
