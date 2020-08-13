import { dateFaker, expect } from '../../../test-utils'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { createQuote } from '../../quotes/fixtures/quote.fixture'
import { CreatePolicyCommand } from '../../../../src/app/policies/domain/create-policy-command'
import { createCreatePolicyCommand } from '../fixtures/createPolicyCommand.fixture'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { SinonStubbedInstance } from 'sinon'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'
import { RoommatesNotAllowedError } from '../../../../src/app/policies/domain/policies.errors'
import { createPartnerFixture } from '../../partners/fixtures/partner.fixture'
import { Partner } from '../../../../src/app/partners/domain/partner'
import Question = Partner.Question

describe('Policies - Domain', async () => {
  describe('#create', async () => {
    const now = new Date('2020-02-29T10:09:08Z')
    const expectedTermEndDate = new Date('2021-04-04T10:09:08.000Z')
    const policyRepository: SinonStubbedInstance<PolicyRepository> = policyRepositoryStub()
    const quote: Quote = createQuote()
    let partner: Partner
    let createPolicyCommand: CreatePolicyCommand

    beforeEach(() => {
      createPolicyCommand = createCreatePolicyCommand({ quoteId: quote.id })
      partner = createPartnerFixture()
      dateFaker.setCurrentDate(now)
      policyRepository.isIdAvailable.resolves(true)
    })

    afterEach(() => {
      policyRepository.isIdAvailable.reset()
    })

    describe('should generate an id', async () => {
      it('which is a string with 12 characters', async () => {
        // When
        const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

        // Then
        expect(createdPolicy.id).to.be.a.string
        expect(createdPolicy.id).to.have.lengthOf(12)
      })

      it('with three first characters are uppercase letters from partner code', async () => {
        // When
        const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

        // Then
        const idPrefix: string = createdPolicy.id.substring(0, 3)
        expect(idPrefix).to.equal('MYP')
      })

      it('with 9 last characters are random numbers', async () => {
        // When
        const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

        // Then
        const idSuffix: string = createdPolicy.id.substring(3, 12)
        expect(idSuffix).to.match(/^[1-9]{9}/)
      })

      it('which does not already exists',
        async () => {
        // Given
          policyRepository.isIdAvailable.onFirstCall().resolves(false)
          policyRepository.isIdAvailable.onSecondCall().resolves(true)

          // When
          const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

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
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

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
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.risk).to.deep.equal(expectedRisk)
    })

    it('should set the other insured to empty list if the partner does not allow roommates and there are no roommates', async () => {
      // Given
      createPolicyCommand.risk.people.otherInsured = []

      const questions: Array<Question> = [{ code: Partner.Question.QuestionCode.Roommate, applicable: false }]
      partner.questions = questions

      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.risk.people.otherInsured).to.be.empty
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
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.contact).to.deep.equal(expectedContact)
    })

    it('should set the partner code', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.partnerCode).to.deep.equal(createPolicyCommand.partnerCode)
    })

    it('should set signatureDate, subscription and paymentDate to undefined because policy is not signed not payed yet', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.signatureDate).to.be.undefined
      expect(createdPolicy.subscriptionDate).to.be.undefined
      expect(createdPolicy.paymentDate).to.be.undefined
    })

    describe('should set startDate and termStartDate', async () => {
      it('to the given start date', async () => {
        // When
        const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

        // Then
        expect(createdPolicy.startDate).to.deep.equal(createPolicyCommand.startDate)
        expect(createdPolicy.termStartDate).to.deep.equal(createPolicyCommand.startDate)
      })

      it('to now by default', async () => {
        // When
        const createPolicyCommandWithNoStartDate: CreatePolicyCommand =
            createCreatePolicyCommand({ quoteId: quote.id, startDate: null })
        const createdPolicy: Policy = await Policy.create(createPolicyCommandWithNoStartDate, quote, policyRepository, partner)

        // Then
        expect(createdPolicy.startDate).to.deep.equal(now)
        expect(createdPolicy.termStartDate).to.deep.equal(now)
      })
    })

    it('should set termEndDate to startDate + 1 year - 1 day by default', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.termEndDate).to.deep.equal(expectedTermEndDate)
    })

    it('should set nbDueMonths to 12 by default', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.nbMonthsDue).to.equal(12)
    })

    it('should set premium to monthlyPrice * nbMonthsDue(12 by default)', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.premium).to.equal(69.84)
    })

    it('should set the policy status to INITIATED', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.status).to.equal(Policy.Status.Initiated)
    })

    it('should set the contractual terms and ipid document links', async () => {
      // When
      const createdPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(createdPolicy.insurance.contractualTerms).to.equal(quote.insurance.contractualTerms)
      expect(createdPolicy.insurance.ipid).to.equal(quote.insurance.ipid)
    })

    it('should throw an error if there are roommates but the partner does not allow it', async () => {
      // Given
      const questions: Array<Question> = [{ code: Partner.Question.QuestionCode.Roommate, applicable: false }]
      partner.questions = questions

      // When
      const promise = Policy.create(createPolicyCommand, quote, policyRepository, partner)

      // Then
      expect(promise).to.be.rejectedWith(RoommatesNotAllowedError, 'The roommates are not allowed for partner myPartner')
    })
  })
})
