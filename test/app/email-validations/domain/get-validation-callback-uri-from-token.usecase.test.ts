import { dateFaker } from '../../../utils/date-faker.test-utils'
import { ValidationToken } from '../../../../src/app/email-validations/domain/validation-token'
import { GetValidationCallbackUriFromToken } from '../../../../src/app/email-validations/domain/get-validation-callback-uri-from-token.usecase'
import { expect, sinon } from '../../../test-utils'
import { ValidationTokenPayload } from '../../../../src/app/email-validations/domain/validation-token-payload'
import { ValidationCallbackUri } from '../../../../src/app/email-validations/domain/validation-callback-uri'
import { ExpiredEmailValidationTokenError, BadEmailValidationToken } from '../../../../src/app/email-validations/domain/email-validation.errors'
import { BadDecryptError } from '../../../../src/app/email-validations/infrastructure/crypto.crypter'
import { createPolicyFixture } from '../../policies/fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { policyRepositoryMock } from '../../policies/fixtures/policy-repository.test-doubles'
import { createQuoteFixture, createQuotePolicyHolderFixture } from '../../quotes/fixtures/quote.fixture'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { quoteRepositoryMock } from '../../quotes/fixtures/quote-repository.test-doubles'

describe('Email Validations - Usecase - Get a validation callback uri from a validation token', async () => {
  const now: Date = new Date('2020-02-12T00:00:00.000Z')
  const decrypter = { encrypt: sinon.mock(), decrypt: sinon.mock() }
  const policyRepository = policyRepositoryMock()
  const quoteRepository = quoteRepositoryMock()
  const validationToken: ValidationToken = { token: '3NCRYPT3DB4S364STR1NG==' }

  beforeEach(async () => {
    dateFaker.setCurrentDate(now)
  })

  afterEach(() => {
    decrypter.encrypt.reset()
    decrypter.decrypt.reset()
    policyRepository.get.reset()
    quoteRepository.get.reset()
    policyRepository.setEmailValidatedAt.reset()
    quoteRepository.update.reset()
  })

  it('should return a callback url from token with policy id when token is valid', async () => {
    // GIVEN
    const validationTokenPayloadString: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      policyId: 'APP746312047',
      expiredAt: new Date()
    }
    const policy: Policy = createPolicyFixture()

    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayloadString))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
        GetValidationCallbackUriFromToken.factory(decrypter, policyRepository, quoteRepository)

    policyRepository.get.withExactArgs(validationTokenPayloadString.policyId).resolves(policy)

    // WHEN
    const validationCallbackUrl: ValidationCallbackUri = await getValidationCallbackUriFromToken(validationToken)

    // THEN
    expect(validationCallbackUrl).to.deep.equal({ callbackUrl: 'http://bicycle-day.com' })
  })

  it('should return a callback url from token with quote id when token is valid', async () => {
    // GIVEN
    const validationTokenPayloadString: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      quoteId: 'QU0T36312047',
      expiredAt: new Date()
    }
    const quote: Quote = createQuoteFixture()

    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayloadString))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
        GetValidationCallbackUriFromToken.factory(decrypter, policyRepository, quoteRepository)

    quoteRepository.get.withExactArgs(validationTokenPayloadString.quoteId).resolves(quote)

    // WHEN
    const validationCallbackUrl: ValidationCallbackUri = await getValidationCallbackUriFromToken(validationToken)

    // THEN
    expect(validationCallbackUrl).to.deep.equal({ callbackUrl: 'http://bicycle-day.com' })
  })

  it('should update policy policy holder email validation date when the policy policy holder email is not validated ?', async () => {
    // GIVEN
    const policyWithInvalidEmail: Policy = createPolicyFixture({ id: 'APP746312047', emailValidationDate: undefined })
    const validationTokenPayloadString: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      expiredAt: new Date(),
      policyId: policyWithInvalidEmail.id
    }

    policyRepository.get.withExactArgs(policyWithInvalidEmail.id).resolves(policyWithInvalidEmail)
    policyRepository.setEmailValidatedAt.withExactArgs(policyWithInvalidEmail.id, now).resolves()
    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayloadString))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
            GetValidationCallbackUriFromToken.factory(decrypter, policyRepository, quoteRepository)

    // WHEN
    await getValidationCallbackUriFromToken(validationToken)

    // THEN
    policyRepository.setEmailValidatedAt.verify()
  })

  it('should update quote policy holder email validation date when the quote policy holder email is not validated', async () => {
    // GIVEN
    const quoteWithInvalidEmail: Quote = createQuoteFixture(
      { id: 'QU0T36312047', policyHolder: createQuotePolicyHolderFixture({ emailValidatedAt: undefined }) }
    )
    const quoteWithValidatedEmail: Quote = createQuoteFixture(
      { id: 'QU0T36312047', policyHolder: createQuotePolicyHolderFixture({ emailValidatedAt: now }) }
    )
    const validationTokenPayloadString: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      expiredAt: new Date(),
      quoteId: quoteWithInvalidEmail.id
    }

    quoteRepository.get.withExactArgs(quoteWithInvalidEmail.id).resolves(quoteWithInvalidEmail)
    quoteRepository.update.withExactArgs(quoteWithValidatedEmail).resolves()
    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayloadString))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
        GetValidationCallbackUriFromToken.factory(decrypter, policyRepository, quoteRepository)

    // WHEN
    await getValidationCallbackUriFromToken(validationToken)

    // THEN
    quoteRepository.update.verify()
  })

  it('should not update the policy with the date of the email validation if already validated', async () => {
    // GIVEN
    const policyId: string = 'APP746312047'
    const validationTokenPayloadString: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      policyId,
      expiredAt: new Date()
    }
    const policyWithEmailAlreadyValidated: Policy = createPolicyFixture({ id: policyId, emailValidationDate: new Date() })

    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayloadString))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
          GetValidationCallbackUriFromToken.factory(decrypter, policyRepository, quoteRepository)

    policyRepository.get.withExactArgs(policyId).resolves(policyWithEmailAlreadyValidated)
    policyRepository.setEmailValidatedAt.withExactArgs(policyId, now).never()

    // WHEN
    await getValidationCallbackUriFromToken(validationToken)

    // THEN
    policyRepository.setEmailValidatedAt.verify()
  })

  it('should not update the quote with the date of the email validation if already validated', async () => {
    // GIVEN
    const quoteId: string = 'APP746312047'
    const validationTokenPayloadString: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      quoteId: quoteId,
      expiredAt: new Date()
    }
    const quoteWithValidatedEmail: Quote = createQuoteFixture(
      { id: 'QU0T36312047', policyHolder: createQuotePolicyHolderFixture({ emailValidatedAt: new Date() }) }
    )

    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayloadString))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
          GetValidationCallbackUriFromToken.factory(decrypter, policyRepository, quoteRepository)

    quoteRepository.get.withExactArgs(quoteId).resolves(quoteWithValidatedEmail)
    quoteRepository.update.withExactArgs(quoteWithValidatedEmail).never()

    // WHEN
    await getValidationCallbackUriFromToken(validationToken)

    // THEN
    quoteRepository.update.verify()
  })

  it('should throw an ExpiredEmailValidationTokenError when token is expired', async () => {
    // GIVEN
    const validationTokenPayload: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      policyId: 'APP746312047',
      expiredAt: new Date('2000-01-30T00:00:00.000Z')
    }

    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayload))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
          GetValidationCallbackUriFromToken.factory(decrypter, policyRepository, quoteRepository)

    // WHEN
    return expect(getValidationCallbackUriFromToken(validationToken))

      // THEN
      .to.be.rejectedWith(ExpiredEmailValidationTokenError)
  })

  it('should throw an BadEmailValidationToken when token is corrupted', async () => {
    // GIVEN
    const corruptedValidationToken: ValidationToken = {
      token: 'B4DT0K3N=='
    }
    decrypter.decrypt.withExactArgs(corruptedValidationToken.token).throws(new BadDecryptError(corruptedValidationToken.token))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
          GetValidationCallbackUriFromToken.factory(decrypter, policyRepository, quoteRepository)

    // WHEN
    return expect(getValidationCallbackUriFromToken(corruptedValidationToken))

      // THEN
      .to.be.rejectedWith(BadEmailValidationToken)
  })
})
