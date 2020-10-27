import * as supertest from 'supertest'
import { expect, sinon, HttpServerForTesting, newMinimalServer } from '../../../../test-utils'
import { container, emailValidationsRoutes } from '../../../../../src/app/email-validations/email-validations.container'
import { ValidationCallbackUri } from '../../../../../src/app/email-validations/domain/validation-callback-uri'
import { ExpiredEmailValidationTokenError } from '../../../../../src/app/email-validations/domain/email-validation.errors'
import { PolicyNotFoundError } from '../../../../../src/app/policies/domain/policies.errors'

describe('Email Validations - API - Integ', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(emailValidationsRoutes())
  })

  describe('POST /internal/v0/email-validations/validate', () => {
    let response: supertest.Response

    describe('when token is valid', () => {
      const expectedCallbackUrlResource = { callback_url: 'http://callback.url.com' }
      const validationCallbackUri: ValidationCallbackUri = { callbackUrl: 'http://callback.url.com' }

      beforeEach(async function () {
        this.timeout(10000)
        sinon.stub(container, 'GetValidationCallbackUriFromToken')
          .withArgs({ token: 'Yofl0qsXdbJ3dgZXzSFLV5/3v/nbeGqPWns/Q==' })
          .resolves(validationCallbackUri)

        response = await httpServer.api()
          .post('/internal/v0/email-validations/validate')
          .send({
            token: 'Yofl0qsXdbJ3dgZXzSFLV5/3v/nbeGqPWns/Q=='
          })
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return an empty object', async () => {
        expect(response.body).to.deep.equal(expectedCallbackUrlResource)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when missing required key', async () => {
        response = await httpServer.api()
          .post('/internal/v0/email-validations/validate')
          .send({ wrong_token_key: '3NCRYPT3DB4S364STR1NG==' })
        expect(response).to.have.property('statusCode', 400)
      })
    })

    describe('when token is expired', () => {
      it('should reply with status 422', async () => {
        const expiredToken: string = '3XP1R3DT0K3N=='

        sinon.stub(container, 'GetValidationCallbackUriFromToken')
          .withArgs({ token: expiredToken })
          .rejects(new ExpiredEmailValidationTokenError(expiredToken))

        response = await httpServer.api()
          .post('/internal/v0/email-validations/validate')
          .send({ token: expiredToken })
        expect(response).to.have.property('statusCode', 422)
      })
    })

    describe('when token is corrupted', () => {
      it('should reply with status 422', async () => {
        const corruptedToken: string = 'C0RRUPT3DT0K3N=='

        sinon.stub(container, 'GetValidationCallbackUriFromToken')
          .withArgs({ token: corruptedToken })
          .rejects(new ExpiredEmailValidationTokenError(corruptedToken))

        response = await httpServer.api()
          .post('/internal/v0/email-validations/validate')
          .send({ token: corruptedToken })
        expect(response).to.have.property('statusCode', 422)
      })
    })

    describe('when the policy associated to the validation does not exists', () => {
      it('should reply with status 422', async () => {
        // Given
        sinon.stub(container, 'GetValidationCallbackUriFromToken')
          .withArgs({ token: 'Yofl0qsXdbJ3dgZXzSFLV5/3v/nbeGqPWns/Q==' })
          .rejects(new PolicyNotFoundError('APP374522902'))

        // When
        response = await httpServer.api()
          .post('/internal/v0/email-validations/validate')
          .send({
            token: 'Yofl0qsXdbJ3dgZXzSFLV5/3v/nbeGqPWns/Q=='
          })

        // Then
        expect(response).to.have.property('statusCode', 422)
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        sinon.stub(container, 'GetValidationCallbackUriFromToken')
          .withArgs({ token: '3NCRYPT3DB4S364STR1NG==' })
          .rejects(new Error())

        response = await httpServer.api()
          .post('/internal/v0/email-validations/validate')
          .send({
            token: '3NCRYPT3DB4S364STR1NG=='
          })

        expect(response).to.have.property('statusCode', 500)
      })
    })
  })
})
