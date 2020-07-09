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
import { EmailValidationQuery } from '../../../../src/app/email-validations/domain/email-validation-query'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'

describe('Policies - Usecase - Create policy', async () => {
  const now = new Date('2020-01-05T10:09:08Z')
  const quote: Quote = createQuote()
  const createPolicyCommand: CreatePolicyCommand = createCreatePolicyCommand({ quoteId: quote.id, startDate: null })
  const policyRepository: SinonStubbedInstance<PolicyRepository> = { save: sinon.stub(), isIdAvailable: sinon.stub(), get: sinon.stub }
  const quoteRepository: SinonStubbedInstance<QuoteRepository> = { save: sinon.stub(), get: sinon.stub() }
  const partnerRepository: SinonStubbedInstance<PartnerRepository> = { getByCode: sinon.stub(), getOffer: sinon.stub(), getCallbackUrl: sinon.stub() }
  const sendValidationLinkToEmailAddress = sinon.stub()
  const createPolicy: CreatePolicy = CreatePolicy.factory(policyRepository, quoteRepository, partnerRepository, sendValidationLinkToEmailAddress)

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
    policyRepository.isIdAvailable.resolves(true)
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
})
