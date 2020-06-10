import * as supertest from 'supertest'
import { expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'

describe('Http API partner-information e2e', async () => {
  let httpServer: HttpServerForTesting
  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('GET /v0/partner-information', () => {
    let response: supertest.Response

    it('return requested partner information', async () => {
      // WHEN
      response = await httpServer.api()
        .get('/v0/partner-information')
        .query({ name: 'studyo' })

      // THEN
      expect(response.body).to.deep.equal({})
    })
  })
})
