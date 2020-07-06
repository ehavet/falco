import { Policy } from '../../../../src/app/policies/domain/policy'
import { CreatePolicyCommand } from '../../../../src/app/policies/domain/create-policy-command'
import { expect, sinon } from '../../../test-utils'
import { CreatePolicy } from '../../../../src/app/policies/domain/create-policy.usecase'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { QuoteRepository } from '../../../../src/app/quotes/domain/quote.repository'
import { SinonStubbedInstance } from 'sinon'
import { createQuote } from '../../quotes/fixtures/quote.fixture'
import { createCreatePolicyCommand } from '../fixtures/createPolicyCommand.fixture'

describe('Policies - Usecase - Create policy', async () => {
  describe('should return the newly created policy', async () => {
    const quote: Quote = createQuote()
    const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quote.id })
    const quoteRepository: SinonStubbedInstance<QuoteRepository> = { save: sinon.stub(), get: sinon.stub() }
    const createPolicy: CreatePolicy = CreatePolicy.factory(quoteRepository)
    const expectedPolicy: Policy = {
      id: '',
      partnerCode: 'myPartner',
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
      },
      contact: {
        lastname: 'Dupont',
        firstname: 'Jean',
        address: '13 rue du loup garou',
        postalCode: 91100,
        city: 'Corbeil-Essones',
        email: 'jeandupont@email.com',
        phoneNumber: '+33684205510'
      }
    }

    it('with the insurance', async () => {
      // Given
      quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)

      // When
      const createdPolicy: Policy = await createPolicy(createPolicyCommand)

      // Then
      expect(createdPolicy.insurance).to.deep.equal(expectedPolicy.insurance)
    })

    it('with the risk', async () => {
      // Given
      quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)

      // When
      const createdPolicy: Policy = await createPolicy(createPolicyCommand)

      // Then
      expect(createdPolicy.risk).to.deep.equal(expectedPolicy.risk)
    })

    it('with the contact', async () => {
      // Given
      quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)

      // When
      const createdPolicy: Policy = await createPolicy(createPolicyCommand)

      // Then
      expect(createdPolicy.contact).to.deep.equal(expectedPolicy.contact)
    })

    it('with the partner code', async () => {
      // Given
      quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)

      // When
      const createdPolicy: Policy = await createPolicy(createPolicyCommand)

      // Then
      expect(createdPolicy.partnerCode).to.equal(expectedPolicy.partnerCode)
    })

    it('with a generated id', async () => {
      // Given
      quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)

      // When
      const createdPolicy: Policy = await createPolicy(createPolicyCommand)

      // Then
      expect(createdPolicy.id).to.exist
      expect(createdPolicy.id).to.be.a.string
      expect(createdPolicy.id).to.have.lengthOf(12)
    })
  })
})
