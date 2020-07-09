import { dateFaker } from '../../../utils/date-faker.test-utils'
import { ValidationToken } from '../../../../src/app/email-validations/domain/validation-token'
import { GetValidationCallbackUriFromToken } from '../../../../src/app/email-validations/domain/get-validation-callback-uri-from-token.usecase'
import { expect, sinon } from '../../../test-utils'
import { ValidationTokenPayload } from '../../../../src/app/email-validations/domain/validation-token-payload'
import { ValidationCallbackUri } from '../../../../src/app/email-validations/domain/validation-callback-uri'
import { ExpiredEmailValidationTokenError, BadEmailValidationToken } from '../../../../src/app/email-validations/domain/email-validation.errors'
import { BadDecryptError } from '../../../../src/app/email-validations/infrastructure/crypto.crypter'

describe('Usecase - Get a validation callback url from a validation token', async () => {
  const now: Date = new Date('2020-02-12T00:00:00.000Z')
  const decrypter = { encrypt: sinon.mock(), decrypt: sinon.mock() }
  const policyRepository = { save: sinon.stub(), isIdAvailable: sinon.stub(), get: sinon.stub(), setEmailValidationDate: sinon.mock() }
  const validationToken: ValidationToken = {
    token: '3NCRYPT3DB4S364STR1NG=='
  }

  beforeEach(async () => {
    dateFaker.setCurrentDate(now)
  })

  afterEach(() => {
    policyRepository.setEmailValidationDate.reset()
    decrypter.encrypt.reset()
    decrypter.decrypt.reset()
  })

  it('should return a callback url from token when token is valid', async () => {
    // GIVEN
    const validationTokenPayloadString: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      policyId: 'APP746312047',
      expiredAt: new Date()
    }

    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayloadString))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
        GetValidationCallbackUriFromToken.factory(decrypter, policyRepository)

    // WHEN
    const validationCallbackUrl: ValidationCallbackUri = await getValidationCallbackUriFromToken(validationToken)

    // THEN
    expect(validationCallbackUrl).to.deep.equal({ callbackUrl: 'http://bicycle-day.com' })
  })

  it('should update the policy with the date of the email validation', async () => {
    // GIVEN
    const validationTokenPayloadString: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      policyId: 'APP746312047',
      expiredAt: new Date()
    }

    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayloadString))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
        GetValidationCallbackUriFromToken.factory(decrypter, policyRepository)

    policyRepository.setEmailValidationDate.withExactArgs(validationTokenPayloadString.policyId, now).resolves()

    // WHEN
    await getValidationCallbackUriFromToken(validationToken)

    // THEN
    policyRepository.setEmailValidationDate.verify()
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
            GetValidationCallbackUriFromToken.factory(decrypter, policyRepository)

    // WHEN
    expect(getValidationCallbackUriFromToken(validationToken))

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
            GetValidationCallbackUriFromToken.factory(decrypter, policyRepository)

    // WHEN
    expect(getValidationCallbackUriFromToken(corruptedValidationToken))

    // THEN
      .to.be.rejectedWith(BadEmailValidationToken)
  })
})
