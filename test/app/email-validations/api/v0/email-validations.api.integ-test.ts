import * as supertest from 'supertest'
import { expect, sinon, HttpServerForTesting, newMinimalServer } from '../../../../test-utils'
import { container, emailValidationsRoutes } from '../../../../../src/app/email-validations/email-validations.container'
import { ValidationCallbackUri } from '../../../../../src/app/email-validations/domain/validation-callback-uri'
import { ExpiredEmailValidationTokenError } from '../../../../../src/app/email-validations/domain/email-validation.errors'

describe('Http API - email validations intégration', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(emailValidationsRoutes())
  })

  describe('POST /v0/email-validations', () => {
    let response: supertest.Response

    describe('when validation link is sended to email to validate', () => {
      beforeEach(async () => {
        sinon.stub(container, 'SendValidationLinkToEmailAddress')
          .withArgs({ email: 'test@email.com', callbackUrl: 'http://url.com' })
          .resolves(undefined)

        response = await httpServer.api()
          .post('/v0/email-validations')
          .send({
            email: 'test@email.com',
            callback_url: 'http://url.com'
          })
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return an empty object', async () => {
        expect(response.body).to.deep.equal({})
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        sinon.stub(container, 'SendValidationLinkToEmailAddress')
          .withArgs({ email: 'test@email.com', callbackUrl: 'http://url.com' })
          .rejects(new Error())

        response = await httpServer.api()
          .post('/v0/email-validations')
          .send({
            email: 'test@email.com',
            callback_url: 'http://url.com'
          })

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when wrong json key provided', async () => {
        response = await httpServer.api()
          .post('/v0/email-validations')
          .send({
            wrong_key: 'wrong',
            email: 'test@email.com',
            callback_url: 'http://url.com'
          })

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when missing required key', async () => {
        response = await httpServer.api()
          .post('/v0/email-validations')
          .send({
            callback_url: 'http://url.com'
          })

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when wrong email format', async () => {
        response = await httpServer.api()
          .post('/v0/email-validations')
          .send({
            email: 'wrong_email_format.com',
            callback_url: 'http://url.com'
          })

        expect(response).to.have.property('statusCode', 400)
      })
    })

    it('should reply with status 400 when wrong uri format', async () => {
      response = await httpServer.api()
        .post('/v0/email-validations')
        .send({
          email: 'test@email.com',
          callback_url: 'wrong.url.com'
        })

      expect(response).to.have.property('statusCode', 400)
    })
  })

  describe('POST /internal/v0/email-validations/validate', () => {
    let response: supertest.Response

    describe('when token is valid', () => {
      const expectedCallbackUrlResource = { callback_url: 'http://callback.url.com' }
      const validationCallbackUri: ValidationCallbackUri = { callbackUrl: 'http://callback.url.com' }

      beforeEach(async () => {
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
