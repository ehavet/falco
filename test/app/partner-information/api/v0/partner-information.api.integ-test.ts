import * as supertest from 'supertest'
import { expect, sinon, HttpServerForTesting, newMinimalServer } from '../../../../test-utils'
import { container, partnerInformationRoutes } from '../../../../../src/app/partner-information/partner-information.container'
import { PartnerInformation } from '../../../../../src/app/partner-information/domain/partner-information'
import { PartnerInformationNotFoundError } from '../../../../../src/app/partner-information/domain/partner-information.errors'

describe('Http API partner information integ', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(partnerInformationRoutes())
  })

  describe('GET /v0/partner-information', () => {
    let response: supertest.Response

    describe('when the partner information is found', () => {
      const expectedInformation: PartnerInformation = { key: 'myPartner' }

      beforeEach(async () => {
        sinon.stub(container, 'GetPartnerInformation').withArgs({ partnerKey: 'myPartner' }).resolves(expectedInformation)
        response = await httpServer.api()
          .get('/v0/partner-information')
          .query({ key: 'myPartner' })
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return an empty object', async () => {
        expect(response.body).to.deep.equal(expectedInformation)
      })
    })

    describe('when the partner information is not found', () => {
      it('should reply with status 404', async () => {
        const partnerKey: string = 'myPartner'
        sinon.stub(container, 'GetPartnerInformation').withArgs({ partnerKey: partnerKey }).rejects(new PartnerInformationNotFoundError(partnerKey))

        response = await httpServer.api()
          .get('/v0/partner-information')
          .query({ key: partnerKey })

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find partner with key : ${partnerKey}`)
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        const partnerKey: string = 'myPartner'
        sinon.stub(container, 'GetPartnerInformation').withArgs({ partnerKey: partnerKey }).rejects(new Error())

        response = await httpServer.api()
          .get('/v0/partner-information')
          .query({ key: partnerKey })

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the key is not provided', async () => {
        response = await httpServer.api()
          .get('/v0/partner-information')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })
})
