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
    const createPolicyQuery: CreatePolicyQuery = {
      quoteId: quote.id,
      risk: {
        property: {
          address: '13 rue du loup garou',
          postalCode: 91100,
          city: 'Corbeil-Essones'
        },
        people: {
          policyHolder: {
            lastname: 'Dupont',
            firstname: 'Jean'
          },
          otherBeneficiaries: [
            {
              lastname: 'Doe',
              firstname: 'John'
            }
          ]
        }
      }
    }
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
      },
      risk: {
        property: {
          roomCount: 2,
          address: '13 rue du loup garou',
          postalCode: 91100,
          city: 'Corbeil-Essones'
        },
        people: {
          policyHolder: {
            lastname: 'Dupont',
            firstname: 'Jean'
          },
          otherBeneficiaries: [
            {
              lastname: 'Doe',
              firstname: 'John'
            }
          ]
        }
      }
    }

    it('with the insurance', async () => {
      // Given
      quoteRepository.get.withArgs(createPolicyQuery.quoteId).resolves(quote)

      // When
      const savedPolicy: Policy = await createPolicy(createPolicyQuery)

      // Then
      expect(savedPolicy.insurance).to.deep.equal(expectedPolicy.insurance)
    })

    it('with the risk', async () => {
      // Given
      quoteRepository.get.withArgs(createPolicyQuery.quoteId).resolves(quote)

      // When
      const savedPolicy: Policy = await createPolicy(createPolicyQuery)

      // Then
      expect(savedPolicy.risk).to.deep.equal(expectedPolicy.risk)
    })
  })
})
