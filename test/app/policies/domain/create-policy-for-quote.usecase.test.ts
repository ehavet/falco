import { expect, sinon } from '../../../test-utils'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { QuoteRepository } from '../../../../src/app/quotes/domain/quote.repository'
import { SinonStubbedInstance } from 'sinon'
import { createQuoteFixture } from '../../quotes/fixtures/quote.fixture'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'
import { createPartnerFixture } from '../../partners/fixtures/partner.fixture'
import { quoteRepositoryStub } from '../../quotes/fixtures/quote-repository.test-doubles'
import { CreatePolicyForQuote } from '../../../../src/app/policies/domain/create-policy-for-quote.usecase'
import { CreatePolicyForQuoteCommand } from '../../../../src/app/policies/domain/create-policy-for-quote-command'
import { createCreatePolicyForQuoteCommand } from '../fixtures/createPolicyForQuoteCommand.fixture'
import { partnerRepositoryStub } from '../../partners/fixtures/partner-repository.test-doubles'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { QuoteNotFoundError } from '../../../../src/app/quotes/domain/quote.errors'
import {
  PolicyHolderEmailValidationError,
  PolicyHolderMissingError,
  PolicyHolderMissingPropertyError, CreatePolicyQuotePartnerOwnershipError,
  PolicyRiskPersonMissingError,
  PolicyRiskPropertyMissingFieldError
} from '../../../../src/app/policies/domain/policies.errors'
import { PropertyType } from '../../../../src/app/common-api/domain/type/property-type'

describe('Policies - Usecase - Create policy for quote', async () => {
  let quote: Quote = createQuoteFixture()
  const policyId: string = 'MYP999682473'
  const emailValidatedAt: Date = new Date()
  const expectedPolicy = createPolicyFixture(
    {
      id: 'MYP999682473',
      partnerCode: quote.partnerCode,
      risk: {
        property: {
          roomCount: 2,
          address: '88 rue des prairies',
          postalCode: '91100',
          city: 'Kyukamura',
          type: PropertyType.FLAT
        },
        people: {
          person: { firstname: 'Jean-Jean', lastname: 'Lapin' },
          otherPeople: [{ firstname: 'John', lastname: 'Doe' }]
        }
      },
      contact: {
        firstname: 'Jean-Jean',
        lastname: 'Lapin',
        address: '88 rue des prairies',
        postalCode: '91100',
        city: 'Kyukamura',
        email: 'jeanjean@email.com',
        phoneNumber: '+33684205510'
      },
      nbMonthsDue: 12,
      premium: 69.84,
      emailValidationDate: emailValidatedAt,
      paymentDate: undefined,
      signatureDate: undefined,
      subscriptionDate: undefined,
      specialOperationsCode: undefined,
      specialOperationsCodeAppliedAt: undefined
    }
  )

  const command: CreatePolicyForQuoteCommand = createCreatePolicyForQuoteCommand({ quoteId: quote.id, partnerCode: quote.partnerCode })
  const policyRepository = policyRepositoryStub({ save: sinon.mock() })
  const quoteRepository: SinonStubbedInstance<QuoteRepository> = quoteRepositoryStub()
  const partnerRepository: SinonStubbedInstance<PartnerRepository> = partnerRepositoryStub()
  const createPolicyForQuote: CreatePolicyForQuote = CreatePolicyForQuote.factory(policyRepository, quoteRepository, partnerRepository)

  beforeEach(() => {
    policyRepository.isIdAvailable.resolves(true)
    partnerRepository.getByCode.resolves(createPartnerFixture())
    quote.policyHolder!.emailValidatedAt = emailValidatedAt
    sinon.stub(Policy, 'generateId').returns(policyId)
  })

  afterEach(() => {
    policyRepository.save.reset()
    quote = createQuoteFixture()
  })

  it('should create and save policy', async () => {
    // Given
    quoteRepository.get.withArgs(command.quoteId).resolves(quote)
    policyRepository.save.withExactArgs(expectedPolicy).resolves()

    // When
    await createPolicyForQuote(command)

    // Then
    policyRepository.save.verify()
  })

  it('should return the created policy', async () => {
    // Given
    quoteRepository.get.withArgs(command.quoteId).resolves(quote)
    policyRepository.save.resolves(expectedPolicy)

    // When
    const policy: Policy = await createPolicyForQuote(command)

    // Then
    expect(policy).to.deep.equal(expectedPolicy)
  })

  it('should throw QuoteNotFoundError when quote is not found', async () => {
    // Given
    quoteRepository.get.withArgs(command.quoteId).rejects(new QuoteNotFoundError(command.quoteId))

    // When
    const promise = createPolicyForQuote(command)

    // Then
    return expect(promise).to.be.rejectedWith(QuoteNotFoundError)
  })

  it('should throw PolicyHolderEmailValidationError when policy holder email is not validated', async () => {
    // Given
    quote.policyHolder!.emailValidatedAt = undefined
    quoteRepository.get.withArgs(command.quoteId).resolves(quote)

    // When
    const promise = createPolicyForQuote(command)

    // Then
    return expect(promise).to.be.rejectedWith(
      PolicyHolderEmailValidationError, `Quote ${command.quoteId} policy holder email should have been validated`
    )
  })

  it('should throw PolicyHolderMissingError when quote policy holder is not completed', async () => {
    // Given
    quote.policyHolder = undefined
    quoteRepository.get.withArgs(command.quoteId).resolves(quote)

    // When
    const promise = createPolicyForQuote(command)

    // Then
    return expect(promise).to.be.rejectedWith(
      PolicyHolderMissingError, `Quote ${command.quoteId} policy holder should be completed`
    )
  })

  it('should throw PolicyRiskPersonMissingError when quote risk person is not completed', async () => {
    // Given
    quote.risk.person = undefined
    quoteRepository.get.withArgs(command.quoteId).resolves(quote)

    // When
    const promise = createPolicyForQuote(command)

    // Then
    return expect(promise).to.be.rejectedWith(
      PolicyRiskPersonMissingError, `Quote ${command.quoteId} risk person should be completed`
    )
  })

  describe('when quote policy holder is not completed', async () => {
    const missingProperties = ['email', 'phoneNumber']

    afterEach(() => { quote = createQuoteFixture() })

    missingProperties.forEach(async (property) => {
      it(`should throw PolicyHolderMissingPropertyError when ${property} is not completed`, async () => {
        // Given
        quote.policyHolder![`${property}`] = undefined
        quoteRepository.get.withArgs(command.quoteId).resolves(quote)

        // When
        const promise = createPolicyForQuote(command)

        // Then
        return expect(promise).to.be.rejectedWith(
          PolicyHolderMissingPropertyError, `Quote ${command.quoteId} policy holder ${property} should be completed`
        )
      })
    })
  })

  describe('when quote risk property city is not completed', async () => {
    const missingProperties = ['address', 'postalCode', 'city']

    afterEach(() => { quote = createQuoteFixture() })

    missingProperties.forEach(async (property) => {
      it(`should throw PolicyRiskPropertyMissingFieldError when ${property} is not completed`, async () => {
        // Given
        quote.risk.property[`${property}`] = undefined
        quoteRepository.get.withArgs(command.quoteId).resolves(quote)

        // When
        const promise = createPolicyForQuote(command)

        // Then
        return expect(promise).to.be.rejectedWith(
          PolicyRiskPropertyMissingFieldError, `Quote ${command.quoteId} risk property ${property} should be completed`
        )
      })
    })
  })

  it('should throw CreatePolicyQuotePartnerOwnershipError when quote does not belong to partner', async () => {
    // Given
    quote.partnerCode = 'notMyPartnerCode'
    quoteRepository.get.withArgs(command.quoteId).resolves(quote)

    // When
    const promise = createPolicyForQuote(command)

    // Then
    return expect(promise).to.be.rejectedWith(
      CreatePolicyQuotePartnerOwnershipError, `Could not create policy with quote ${command.quoteId} that does not belong to ${command.partnerCode}`
    )
  })
})
