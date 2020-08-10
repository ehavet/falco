import * as supertest from 'supertest'
import { expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'

describe('Partners - API - E2E', async () => {
  let httpServer: HttpServerForTesting
  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('GET /internal/v0/partners/:id', () => {
    let response: supertest.Response

    it('should return the requested partner', async () => {
      // WHEN
      response = await httpServer.api()
        .get('/internal/v0/partners/studyo')

      // THEN
      expect(response.body).to.deep.equal({
        code: 'studyo',
        translation_key: 'studyo',
        questions: {
          room_count: {
            options: [1, 2, 3]
          },
          roommate: {
            available: true
          }
        }
      })
    })
  })
})
