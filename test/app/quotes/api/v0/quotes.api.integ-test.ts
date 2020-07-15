import * as supertest from 'supertest'
import { expect, sinon, HttpServerForTesting, newMinimalServer } from '../../../../test-utils'
import { Quote } from '../../../../../src/app/quotes/domain/quote'
import { container, quoteRoutes } from '../../../../../src/app/quotes/quote.container'
import { PartnerNotFoundError } from '../../../../../src/app/partners/domain/partner.errors'
import { NoPartnerInsuranceForRiskError } from '../../../../../src/app/quotes/domain/quote.errors'

describe('Http API - Quotes - Integ', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(quoteRoutes())
  })

  describe('POST /v0/quotes', () => {
    let response: supertest.Response

    describe('when the quote is created', () => {
      const quote: Quote = {
        id: 'UD65X3A',
        partnerCode: 'myPartner',
        risk: {
          property: {
            roomCount: 2
          }
        },
        insurance: {
          estimate: {
            monthlyPrice: 5.82,
            defaultDeductible: 150,
            defaultCeiling: 7000
          },
          currency: 'EUR',
          simplifiedCovers: ['ACDDE', 'ACVOL'],
          productCode: 'APP658',
          productVersion: '2020-07-15',
          contractualTerms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid'
        }
      }

      const expectedResourceQuote = {
        id: 'UD65X3A',
        risk: {
          property: {
            room_count: 2
          }
        },
        insurance: {
          monthly_price: 5.82,
          default_deductible: 150,
          default_ceiling: 7000,
          currency: 'EUR',
          simplified_covers: ['ACDDE', 'ACVOL'],
          product_code: 'APP658',
          product_version: '2020-07-15',
          contractual_terms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid'
        },
        code: 'myPartner'
      }

      beforeEach(async () => {
        // Given
        sinon.stub(container, 'GetQuote').withArgs({ partnerCode: 'myPartner', risk: quote.risk }).resolves(quote)

        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: 'myPartner', risk: { property: { room_count: 2 } } })
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 201)
      })

      it('should the created quote', async () => {
        expect(response.body).to.deep.equal(expectedResourceQuote)
      })
    })

    describe('when the partner is not found', () => {
      it('should reply with status 404', async () => {
        // Given
        const partnerCode: string = 'unknownPartner'
        const risk = { property: { roomCount: 2 } }
        sinon.stub(container, 'GetQuote').withArgs({ partnerCode, risk }).rejects(new PartnerNotFoundError(partnerCode))

        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: partnerCode, risk: { property: { room_count: 2 } } })
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find partner with code : ${partnerCode}`)
      })
    })

    describe('when there is no insurance for the given risk', () => {
      it('should reply with status 422', async () => {
        // Given
        const partnerCode: string = 'myPartner'
        const risk = { property: { roomCount: 2 } }
        sinon.stub(container, 'GetQuote').withArgs({ partnerCode, risk }).rejects(new NoPartnerInsuranceForRiskError(partnerCode, risk))

        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: partnerCode, risk: { property: { room_count: 2 } } })
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'Partner with code myPartner does not have an insurance for risk {"property":{"roomCount":2}}')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when there is no code', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ risk: { property: { room_count: 2 } } })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when there is no risk', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: 'myPartner' })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when there is a risk but no property risk', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: 'myPartner', risk: { } })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when there is a property risk but no room count', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: 'myPartner', risk: { property: {} } })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })
})
