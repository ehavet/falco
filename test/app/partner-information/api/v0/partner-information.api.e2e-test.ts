import * as supertest from 'supertest'
import { expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'

describe('Http API partner e2e', async () => {
  let httpServer: HttpServerForTesting
  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('GET /internal/v0/partner/:id', () => {
    let response: supertest.Response

    it('should return the requested partner', async () => {
      // WHEN
      response = await httpServer.api()
        .get('/internal/v0/partner/studyo')

      // THEN
      expect(response.body).to.deep.equal({ key: 'studyo' })
    })
  })
})
