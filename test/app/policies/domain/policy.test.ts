import { dateFaker, expect, sinon } from '../../../test-utils'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { createQuote } from '../../quotes/fixtures/quote.fixture'
import { CreatePolicyCommand } from '../../../../src/app/policies/domain/create-policy-command'
import { createCreatePolicyCommand } from '../fixtures/createPolicyCommand.fixture'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { SinonStubbedInstance } from 'sinon'

describe('Policies - Domain', async () => {
  describe('#createPolicy', async () => {
    const now = new Date('2020-02-29T10:09:08Z')
    const expectedTermEndDate = new Date('2021-02-27T10:09:08Z')
    const policyRepository: SinonStubbedInstance<PolicyRepository> = { save: sinon.stub(), isIdAvailable: sinon.stub() }
    const quote: Quote = createQuote()
    const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quote.id })

    beforeEach(() => {
      dateFaker.setCurrentDate(now)
      policyRepository.isIdAvailable.resolves(true)
    })

    afterEach(() => {
      policyRepository.isIdAvailable.reset()
    })

    describe('should generate an id', async () => {
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

    it('should set the insurance from the quote', async () => {
      // When
      const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

      // Then
      expect(createdPolicy.insurance).to.deep.equal(quote.insurance)
    })

    it('should set the risk from the quote and the query', async () => {
      // Given
      const expectedRisk: Policy.Risk = {
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
          otherInsured: [
            {
              lastname: 'Doe',
              firstname: 'John'
            }
          ]
        }
      }
      // When
      const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

      // Then
      expect(createdPolicy.risk).to.deep.equal(expectedRisk)
    })

    it('should set the contact', async () => {
      // Given
      const expectedContact: Policy.Contact = {
        lastname: 'Dupont',
        firstname: 'Jean',
        address: '13 rue du loup garou',
        postalCode: 91100,
        city: 'Corbeil-Essones',
        email: 'jeandupont@email.com',
        phoneNumber: '+33684205510'
      }

      // When
      const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

      // Then
      expect(createdPolicy.contact).to.deep.equal(expectedContact)
    })

    it('should set the partner code', async () => {
      // When
      const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

      // Then
      expect(createdPolicy.partnerCode).to.deep.equal(createPolicyCommand.partnerCode)
    })

    it('should set signatureDate, subscription and paymentDate to null because policy is not signed not payed yet', async () => {
      // When
      const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

      // Then
      expect(createdPolicy.signatureDate).to.be.null
      expect(createdPolicy.subscriptionDate).to.be.null
      expect(createdPolicy.paymentDate).to.be.null
    })

    describe('should set startDate and termStartDate', async () => {
      it('to the given start date', async () => {
        // When
        const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

        // Then
        expect(createdPolicy.startDate).to.deep.equal(createPolicyCommand.startDate)
        expect(createdPolicy.termStartDate).to.deep.equal(createPolicyCommand.startDate)
      })

      it('to now by default', async () => {
        // When
        const createPolicyCommandWithNoStartDate: CreatePolicyCommand =
            createCreatePolicyCommand({ quoteId: quote.id, startDate: null })
        const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommandWithNoStartDate, quote, policyRepository)

        // Then
        expect(createdPolicy.startDate).to.deep.equal(now)
        expect(createdPolicy.termStartDate).to.deep.equal(now)
      })
    })

    it('should set termEndDate to termStartDate + 1 year - 1 day by default', async () => {
      // When
      const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

      // Then
      expect(createdPolicy.termEndDate).to.deep.equal(expectedTermEndDate)
    })

    it('should set nbDueMonths to 12 by default', async () => {
      // When
      const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

      // Then
      expect(createdPolicy.nbMonthsDue).to.equal(12)
    })

    it('should set premium to monthlyPrice * nbMonthsDue(12 by default)', async () => {
      // When
      const createdPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)

      // Then
      expect(createdPolicy.premium).to.equal(69.84)
    })
  })
})
