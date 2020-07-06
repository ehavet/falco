import { expect, sinon } from '../../../test-utils'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { createQuote } from '../../quotes/fixtures/quote.fixture'
import { CreatePolicyCommand } from '../../../../src/app/policies/domain/create-policy-command'
import { createCreatePolicyCommand } from '../fixtures/createPolicyCommand.fixture'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { SinonStubbedInstance } from 'sinon'

describe('Policies - Domain', async () => {
  describe('#createPolicy', async () => {
    describe('should generate an id', async () => {
      const policyRepository: SinonStubbedInstance<PolicyRepository> = { isIdAvailable: sinon.stub() }
      const quote: Quote = createQuote()
      const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quote.id })

      beforeEach(() => {
        policyRepository.isIdAvailable.resolves(true)
      })

      afterEach(() => {
        policyRepository.isIdAvailable.reset()
      })

      it('which is a string with 12 characters', async () => {
        // When
        const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

        // Then
        expect(createdPolicy.id).to.be.a.string
        expect(createdPolicy.id).to.have.lengthOf(12)
      })

      it('with three first characters are uppercase letters from partner code', async () => {
        // When
        const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

        // Then
        const idPrefix: string = createdPolicy.id.substring(0, 3)
        expect(idPrefix).to.equal('MYP')
      })

      it('with 9 last characters are random numbers', async () => {
        // When
        const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

        // Then
        const idSuffix: string = createdPolicy.id.substring(3, 12)
        expect(idSuffix).to.match(/^[1-9]{9}/)
      })

      it('which does not already exists', async () => {
        // Given
        policyRepository.isIdAvailable.onFirstCall().resolves(false)
        policyRepository.isIdAvailable.onSecondCall().resolves(true)

        // When
        const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

        // Then
        const existingPolicyId = policyRepository.isIdAvailable.getCall(0).args[0]
        const nonExistingPolicyId = policyRepository.isIdAvailable.getCall(1).args[0]
        expect(policyRepository.isIdAvailable).to.have.been.calledTwice
        expect(createdPolicy.id).to.not.equal(existingPolicyId)
        expect(createdPolicy.id).to.equal(nonExistingPolicyId)
      })
    })
  })
})
