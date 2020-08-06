import * as supertest from 'supertest'
import { expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'

describe('Health Checks - API - E2E', async () => {
  let httpServer: HttpServerForTesting
  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('GET /internal/v0/health-checks/readiness', async () => {
    let response: supertest.Response

    it('should return a readiness state UP', async () => { // WHEN
      response = await httpServer.api().get('/internal/v0/health-checks/readiness')
      // THEN
      expect(response.body).to.deep.equal({ state: 'UP' })
    })
  })
})
