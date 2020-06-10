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
    const expectedInformation: PartnerInformation = {}

    describe('when the partner information is found', () => {
      beforeEach(async () => {
        sinon.stub(container, 'GetPartnerInformation').withArgs({ name: 'myPartner' }).resolves(expectedInformation)
        response = await httpServer.api()
          .get('/v0/partner-information')
          .query({ name: 'myPartner' })
      })

      it('replies with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('returns empty object', async () => {
        expect(response.body).to.deep.equal(expectedInformation)
      })
    })

    describe('when the partner information is not found', () => {
      it('replies with status 404', async () => {
        const partnerName: string = 'myPartner'
        sinon.stub(container, 'GetPartnerInformation').withArgs({ name: partnerName }).rejects(new PartnerInformationNotFoundError(partnerName))

        response = await httpServer.api()
          .get('/v0/partner-information')
          .query({ name: partnerName })

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find partner with name : ${partnerName}`)
      })
    })

    describe('when there is an unknown error', () => {
      it('replies with status 500 when unknown error', async () => {
        const partnerName: string = 'myPartner'
        sinon.stub(container, 'GetPartnerInformation').withArgs({ name: partnerName }).rejects(new Error())

        response = await httpServer.api()
          .get('/v0/partner-information')
          .query({ name: partnerName })

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('replies with status 400 when the name is not provided', async () => {
        response = await httpServer.api()
          .get('/v0/partner-information')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })
})
