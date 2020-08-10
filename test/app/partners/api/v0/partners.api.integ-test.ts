import * as supertest from 'supertest'
import { expect, sinon, HttpServerForTesting, newMinimalServer } from '../../../../test-utils'
import { container, partnerRoutes } from '../../../../../src/app/partners/partner.container'
import { Partner } from '../../../../../src/app/partners/domain/partner'
import { PartnerNotFoundError } from '../../../../../src/app/partners/domain/partner.errors'

describe('Partners - API - Integ', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(partnerRoutes())
  })

  describe('GET /internal/v0/partners/:id', () => {
    let response: supertest.Response

    describe('when the partner is found', () => {
      const partner: Partner = {
        code: 'myPartnerKey',
        translationKey: 'myPartnerTranslationKey',
        callbackUrl: 'http://myPartner-callback.com',
        questions: [{
          code: Partner.Question.QuestionCode.RoomCount,
          required: true,
          options: {
            list: [1, 2]
          }
        },
        {
          code: Partner.Question.QuestionCode.Roommate,
          available: true
        }
        ]
      }

      const expectedResourcePartner = {
        code: 'myPartnerKey',
        translation_key: 'myPartnerTranslationKey',
        questions: {
          room_count: {
            required: true,
            options: [1, 2]
          },
          roommate: {
            available: true
          }
        }
      }

      beforeEach(async () => {
        sinon.stub(container, 'GetPartnerByCode').withArgs({ partnerCode: 'myPartner' }).resolves(partner)
        response = await httpServer.api()
          .get('/internal/v0/partners/myPartner')
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return an empty object', async () => {
        expect(response.body).to.deep.equal(expectedResourcePartner)
      })
    })

    describe('when the partner is not found', () => {
      it('should reply with status 404', async () => {
        const partnerCode: string = 'myPartner'
        sinon.stub(container, 'GetPartnerByCode').withArgs({ partnerCode: partnerCode }).rejects(new PartnerNotFoundError(partnerCode))

        response = await httpServer.api()
          .get('/internal/v0/partners/myPartner')

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find partner with code : ${partnerCode}`)
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        const partnerCode: string = 'myPartner'
        sinon.stub(container, 'GetPartnerByCode').withArgs({ partnerCode: partnerCode }).rejects(new Error())

        response = await httpServer.api()
          .get('/internal/v0/partners/myPartner')

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when id is too long', async () => {
        response = await httpServer.api()
          .get('/internal/v0/partners/1234567891012345678910123456789101234567891012345678910')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })
})
