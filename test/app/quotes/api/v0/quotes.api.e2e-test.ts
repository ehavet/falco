import * as supertest from 'supertest'
import { dateFaker, expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'
import { QuoteSqlModel } from '../../../../../src/app/quotes/infrastructure/quote-sql.model'

async function resetDb () {
  await QuoteSqlModel.destroy({ truncate: true, cascade: true })
}

describe('Http API quotes e2e', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('POST /v0/quotes/', () => {
    let response: supertest.Response
    const now = new Date('2020-04-18T10:09:08Z')

    beforeEach(() => {
      dateFaker.setCurrentDate(now)
    })

    afterEach(async () => {
      await resetDb()
    })

    it('should return the quote', async () => {
      // When
      response = await httpServer.api()
        .post('/v0/quotes')
        .send({ code: 'studyo', risk: { property: { room_count: 2 } } })
        .set('X-Consumer-Username', 'studyo')

      // Then
      expect(response.body).to.deep.equal({
        id: response.body.id,
        risk: {
          property: {
            room_count: 2
          }
        },
        insurance: {
          monthly_price: 7.50,
          currency: 'EUR',
          default_deductible: 120,
          default_ceiling: 5000,
          simplified_covers: ['ACDDE', 'ACINCEX', 'ACVOL', 'ACASSHE', 'ACDEFJU', 'ACRC'],
          product_code: 'APP658',
          product_version: '2020-07-15'
        },
        code: 'studyo'
      })
    })

    it('should save the quote', async () => {
      // When
      response = await httpServer.api()
        .post('/v0/quotes')
        .send({ code: 'partnerCode', risk: { property: { room_count: 2 } } })
        .set('X-Consumer-Username', 'partnerCode')

      // Then
      const savedQuote = QuoteSqlModel.findByPk(response.body.id)
      expect(savedQuote).not.to.be.undefined
    })
  })
})
