import { Policy } from '../../../../src/app/policies/domain/policy'
import { CreatePolicyCommand } from '../../../../src/app/policies/domain/create-policy-command'
import { dateFaker, expect, sinon } from '../../../test-utils'
import { CreatePolicy } from '../../../../src/app/policies/domain/create-policy.usecase'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { QuoteRepository } from '../../../../src/app/quotes/domain/quote.repository'
import { SinonStubbedInstance } from 'sinon'
import { createQuoteFixture } from '../../quotes/fixtures/quote.fixture'
import { createCreatePolicyCommand } from '../fixtures/createPolicyCommand.fixture'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { createOngoingPolicyFixture } from '../fixtures/policy.fixture'
import { EmailValidationQuery } from '../../../../src/app/email-validations/domain/email-validation-query'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'
import { createPartnerFixture } from '../../partners/fixtures/partner.fixture'
import {
  PolicyRiskPropertyMissingFieldError,
  PolicyRiskRoommatesNotAllowedError
} from '../../../../src/app/policies/domain/policies.errors'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { quoteRepositoryStub } from '../../quotes/fixtures/quote-repository.test-doubles'
import Question = Partner.Question

describe('Policies - Usecase - Create policy', async () => {
  const now = new Date('2020-01-05T10:09:08Z')
  const quote: Quote = createQuoteFixture()
  const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quote.id, startDate: null })
  const policyRepository: SinonStubbedInstance<PolicyRepository> = policyRepositoryStub()
  const quoteRepository: SinonStubbedInstance<QuoteRepository> = quoteRepositoryStub()
  const partnerRepository: SinonStubbedInstance<PartnerRepository> = { getByCode: sinon.stub(), getOffer: sinon.stub(), getCallbackUrl: sinon.stub(), getOperationCodes: sinon.stub() }
  const sendValidationLinkToEmailAddress = sinon.stub()
  const createPolicy: CreatePolicy = CreatePolicy.factory(policyRepository, quoteRepository, partnerRepository, sendValidationLinkToEmailAddress)

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
    policyRepository.isIdAvailable.resolves(true)
    partnerRepository.getByCode.resolves(createPartnerFixture())
  })

  afterEach(() => {
    sendValidationLinkToEmailAddress.reset()
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
    expectedPolicy.risk.property.address = '88 rue des prairies'
    expectedPolicy.risk.property.postalCode = 91100
    expectedPolicy.risk.property.city = 'Kyukamura'

    expectedPolicy.contact.address = '88 rue des prairies'
    expectedPolicy.contact.postalCode = 91100
    expectedPolicy.contact.city = 'Kyukamura'
    return expect(saveSpy).to.have.been.calledWith(expectedPolicy)
  })

  it('should return the newly created policy', async () => {
    // Given
    const expectedPolicy = createOngoingPolicyFixture()
    quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)
    policyRepository.save.resolves(expectedPolicy)

    // When
    const createdPolicy: Policy = await createPolicy(createPolicyCommand)

    // Then
    expect(createdPolicy).to.deep.equal(expectedPolicy)
  })

  it('should send an email to the contact to validate the email', async () => {
    // Given
    const expectedPolicy = createOngoingPolicyFixture()
    quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)
    policyRepository.save.resolves(expectedPolicy)

    const callbackUrl: string = 'http://callback-url.com'
    partnerRepository.getCallbackUrl.withArgs(expectedPolicy.partnerCode).resolves(callbackUrl)

    const emailValidationQuery: EmailValidationQuery = {
      email: expectedPolicy.contact.email,
      callbackUrl: callbackUrl,
      partnerCode: expectedPolicy.partnerCode,
      policyId: expectedPolicy.id
    }
    sendValidationLinkToEmailAddress.resolves()

    // When
    await createPolicy(createPolicyCommand)

    // Then
    const sendEmailSpy = sendValidationLinkToEmailAddress.getCall(0)
    const actualEmailValidationQuery: EmailValidationQuery = sendEmailSpy.args[0]
    expect(actualEmailValidationQuery.email).to.equal(emailValidationQuery.email)
    expect(actualEmailValidationQuery.callbackUrl).to.equal(emailValidationQuery.callbackUrl)
    expect(actualEmailValidationQuery.partnerCode).to.equal(emailValidationQuery.partnerCode)
    expect(actualEmailValidationQuery.policyId).to.exist
  })

  it('should throw an error if there are roommates but the partner does not allow it', async () => {
    // Given
    partnerRepository.getByCode.reset()
    const questions: Array<Question> = [{ code: Partner.Question.QuestionCode.Roommate, applicable: false }]
    const partner = createPartnerFixture({ questions })
    partnerRepository.getByCode.resolves(partner)
    quoteRepository.get.withArgs(createPolicyCommand.quoteId).resolves(quote)

    // When
    const promise = createPolicy(createPolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyRiskRoommatesNotAllowedError)
  })

  it('should throw an error if address is not complete in a quote or command', async () => {
    // Given
    const policyCommand = createCreatePolicyCommand({
      risk: {
        property: {
          roomCount: 2,
          address: undefined,
          postalCode: undefined,
          city: undefined
        }
      }
    } as any)
    quoteRepository.get.withArgs(policyCommand.quoteId).resolves(createQuoteFixture({
      risk: {
        property: {
          roomCount: 2,
          address: undefined,
          postalCode: undefined,
          city: undefined
        }
      }
    } as any))

    // When
    const promise = createPolicy(policyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyRiskPropertyMissingFieldError)
  })
})
