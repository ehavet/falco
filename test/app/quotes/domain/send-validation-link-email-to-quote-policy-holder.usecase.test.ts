import { dateFaker, expect, sinon } from '../../../test-utils'
import { partnerRepositoryStub } from '../../partners/fixtures/partner-repository.test-doubles'
import { createQuoteFixture } from '../fixtures/quote.fixture'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { SendValidationLinkEmailToQuotePolicyHolder } from '../../../../src/app/quotes/domain/send-validation-link-email-to-quote-policy-holder.usecase'
import { SinonStubbedInstance } from 'sinon'
import { QuoteRepository } from '../../../../src/app/quotes/domain/quote.repository'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { QuoteNotFoundError, QuotePolicyHolderEmailNotFoundError } from '../../../../src/app/quotes/domain/quote.errors'
import { PartnerNotFoundError } from '../../../../src/app/partners/domain/partner.errors'

describe('Usecase - Send an email validation link email to quote policy holder', async () => {
  const quoteRepository: SinonStubbedInstance<QuoteRepository> = { save: sinon.stub(), get: sinon.stub(), update: sinon.mock() }
  const partnerRepository: SinonStubbedInstance<PartnerRepository> = partnerRepositoryStub()
  const sendValidationLinkToEmailAddress = sinon.stub()
  const quoteId: string = 'QU0T31D'
  const partnerCode: string = 'serotonine'

  beforeEach(async () => {
    dateFaker.setCurrentDate(new Date('2020-08-12T00:00:00.000Z'))
  })

  afterEach(() => {
    quoteRepository.get.reset()
    partnerRepository.getCallbackUrl.reset()
  })

  it('should send validation link email to policy holder email address', async () => {
    // GIVEN
    const quote: Quote = createQuoteFixture(
      {
        id: quoteId,
        partnerCode: partnerCode,
        policyHolder: {
          firstname: 'Albert',
          lastname: 'Hofmann',
          address: '88 rue des prairies',
          postalCode: '91100',
          city: 'Kyukamura',
          email: 'albert.hofmann@science.org',
          phoneNumber: '+33684205510'
        }
      }
    )

    quoteRepository.get.withArgs(quoteId).resolves(quote)
    partnerRepository.getCallbackUrl.withArgs(partnerCode).resolves('http://partner/callback/url')
    const sendValidationLinkEmailToQuotePolicyHolder: SendValidationLinkEmailToQuotePolicyHolder =
        SendValidationLinkEmailToQuotePolicyHolder.factory(quoteRepository, partnerRepository, sendValidationLinkToEmailAddress)
    // WHEN
    await sendValidationLinkEmailToQuotePolicyHolder(quoteId)
    // THEN
    sinon.assert.calledOnceWithExactly(sendValidationLinkToEmailAddress, {
      email: quote.policyHolder?.email,
      callbackUrl: 'http://partner/callback/url',
      partnerCode: quote.partnerCode,
      quoteId: quoteId
    })
  })

  it('should throw QuoteNotFoundError when the quote is not found', async () => {
    // GIVEN
    quoteRepository.get.withArgs(quoteId).rejects(new QuoteNotFoundError(quoteId))
    const sendValidationLinkEmailToQuotePolicyHolder: SendValidationLinkEmailToQuotePolicyHolder =
        SendValidationLinkEmailToQuotePolicyHolder.factory(quoteRepository, partnerRepository, sendValidationLinkToEmailAddress)
    // WHEN
    const promise = sendValidationLinkEmailToQuotePolicyHolder(quoteId)
    // THEN
    return expect(promise).to.be.rejectedWith(QuoteNotFoundError)
  })

  it('should throw PartnerNotFoundError when the quote partner is not found', async () => {
    // GIVEN
    const quote: Quote = createQuoteFixture({ id: quoteId, partnerCode: partnerCode })
    quoteRepository.get.withArgs(quoteId).resolves(quote)
    partnerRepository.getCallbackUrl.withArgs(partnerCode).rejects(new PartnerNotFoundError(partnerCode))
    const sendValidationLinkEmailToQuotePolicyHolder: SendValidationLinkEmailToQuotePolicyHolder =
        SendValidationLinkEmailToQuotePolicyHolder.factory(quoteRepository, partnerRepository, sendValidationLinkToEmailAddress)
    // WHEN
    const promise = sendValidationLinkEmailToQuotePolicyHolder(quoteId)
    // THEN
    return expect(promise).to.be.rejectedWith(PartnerNotFoundError)
  })

  it('should throw QuotePolicyHolderEmailNotFoundError when undefined policy holder email', async () => {
    // GIVEN
    const quote: Quote = createQuoteFixture(
      {
        id: quoteId,
        partnerCode: partnerCode,
        policyHolder: {
          firstname: 'Albert',
          lastname: 'Hofmann',
          address: '88 rue des prairies',
          postalCode: '91100',
          city: 'Kyukamura',
          email: undefined,
          phoneNumber: '+33684205510'
        }
      }
    )

    quoteRepository.get.withArgs(quoteId).resolves(quote)
    partnerRepository.getCallbackUrl.withArgs(partnerCode).resolves('http://partner/callback/url')
    const sendValidationLinkEmailToQuotePolicyHolder: SendValidationLinkEmailToQuotePolicyHolder =
        SendValidationLinkEmailToQuotePolicyHolder.factory(quoteRepository, partnerRepository, sendValidationLinkToEmailAddress)
    // WHEN
    const promise = sendValidationLinkEmailToQuotePolicyHolder(quoteId)
    // THEN
    return expect(promise).to.be.rejectedWith(QuotePolicyHolderEmailNotFoundError)
  })
})
