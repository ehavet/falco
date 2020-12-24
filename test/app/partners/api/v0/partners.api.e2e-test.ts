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
        customer_support_email: 'help@appenin.fr',
        first_question: 'RoomCount',
        questions: [
          {
            code: 'RoomCount',
            default_next_step: 'Address',
            default_option: 1,
            options: [
              { option: 1 },
              { option: 2 },
              { option: 3 }
            ],
            to_ask: true
          },
          {
            code: 'Address',
            default_next_step: 'SUBMIT',
            to_ask: true
          },
          {
            code: 'Roommate',
            applicable: true,
            maximum_numbers: [
              { room_count: 1, value: 0 },
              { room_count: 2, value: 1 },
              { room_count: 3, value: 2 }
            ]
          }
        ]
      })
    })
  })
})
