import { dateFaker } from '../../../utils/date-faker.test-utils'
import { ValidationToken } from '../../../../src/app/email-validations/domain/validation-token'
import { GetValidationCallbackUriFromToken } from '../../../../src/app/email-validations/domain/get-validation-callback-uri-from-token.usecase'
import { expect, sinon } from '../../../test-utils'
import { ValidationTokenPayload } from '../../../../src/app/email-validations/domain/validation-token-payload'
import { ValidationCallbackUri } from '../../../../src/app/email-validations/domain/validation-callback-uri'
import { ExpiredEmailValidationTokenError, BadEmailValidationToken } from '../../../../src/app/email-validations/domain/email-validation.errors'
import { BadDecryptError } from '../../../../src/app/email-validations/infrastructure/crypto.crypter'

describe('Usecase - Get a validation callback url from a validation token', async () => {
  before(async () => {
    dateFaker.setCurrentDate(new Date('2020-02-12T00:00:00.000Z'))
  })

  after(function () {
    dateFaker.restoreDate()
  })

  it('should return a callback url from token when token is valid', async () => {
    // GIVEN
    const decrypter = { encrypt: sinon.mock(), decrypt: sinon.mock() }
    const validationTokenPayloadString: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      expiredAt: new Date()
    }
    const validationToken: ValidationToken = {
      token: '3NCRYPT3DB4S364STR1NG=='
    }
    decrypter.decrypt.withExactArgs(validationToken.token).returns(JSON.stringify(validationTokenPayloadString))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
        GetValidationCallbackUriFromToken.factory(decrypter)
    // WHEN
    const validationCallbackUrl: ValidationCallbackUri = await getValidationCallbackUriFromToken(validationToken)
    // THEN
    expect(validationCallbackUrl).to.deep.equal({ callbackUrl: 'http://bicycle-day.com' })
  })

  it('should throw an ExpiredEmailValidationTokenError when token is expired', async () => {
    // GIVEN
    const decrypter = { encrypt: sinon.mock(), decrypt: sinon.mock() }
    const validationTokenPayload: ValidationTokenPayload = {
      email: 'albert.hofmann@science.org',
      callbackUrl: 'http://bicycle-day.com',
      expiredAt: new Date('2000-01-30T00:00:00.000Z')
    }
    const validationTokenPayloadString: string = JSON.stringify(validationTokenPayload)
    const validationToken: ValidationToken = {
      token: '3NCRYPT3DB4S364STR1NG=='
    }
    decrypter.decrypt.withExactArgs(validationToken.token).returns(validationTokenPayloadString)
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
            GetValidationCallbackUriFromToken.factory(decrypter)
    // WHEN
    expect(getValidationCallbackUriFromToken(validationToken))
    // THEN
      .to.be.rejectedWith(ExpiredEmailValidationTokenError)
  })

  it('should throw an BadEmailValidationToken when token is corrupted', async () => {
    // GIVEN
    const decrypter = { encrypt: sinon.mock(), decrypt: sinon.mock() }
    const validationToken: ValidationToken = {
      token: 'B4DT0K3N=='
    }
    decrypter.decrypt.withExactArgs(validationToken.token).throws(new BadDecryptError(validationToken.token))
    const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken =
            GetValidationCallbackUriFromToken.factory(decrypter)
    // WHEN
    expect(getValidationCallbackUriFromToken(validationToken))
    // THEN
      .to.be.rejectedWith(BadEmailValidationToken)
  })
})
