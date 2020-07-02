import { Policy } from '../../../../src/app/policies/domain/policy'
import { CreatePolicyQuery } from '../../../../src/app/policies/domain/create-policy-query'
import { expect, sinon } from '../../../test-utils'
import { CreatePolicy } from '../../../../src/app/policies/domain/create-policy.usecase'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { QuoteRepository } from '../../../../src/app/quotes/domain/quote.repository'
import { SinonStubbedInstance } from 'sinon'
import { createQuote } from '../../quotes/fixtures/quote.fixture'

describe('Policies - Usecase - Create policy', async () => {
  describe('should return the newly created policy', async () => {
    const quote: Quote = createQuote()

    it('with the insurance', async () => {
      // Given
      const createPolicyQuery: CreatePolicyQuery = { quoteId: quote.id }
      const quoteRepository: SinonStubbedInstance<QuoteRepository> = { save: sinon.stub(), get: sinon.stub() }
      const createPolicy: CreatePolicy = CreatePolicy.factory(quoteRepository)
      const expectedPolicy: Policy = {
        insurance: {
          estimate: {
            monthlyPrice: 5.82,
            defaultDeductible: 150,
            defaultCeiling: 7000
          },
          currency: 'EUR',
          simplifiedCovers: ['ACDDE', 'ACVOL'],
          productCode: 'MRH-Loc-Etud',
          productVersion: 'v2020-02-01'
        }
      }

      quoteRepository.get.withArgs(createPolicyQuery.quoteId).resolves(quote)

      // When
      const savedPolicy: Policy = await createPolicy(createPolicyQuery)

      // Then
      expect(savedPolicy.insurance).to.deep.equal(expectedPolicy.insurance)
    })
  })
})
