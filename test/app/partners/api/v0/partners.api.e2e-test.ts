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
        first_question_to_ask: 'address',
        questions: [
          {
            code: 'property_type',
            to_ask: false,
            default_value: 'FLAT',
            default_next_step: 'occupancy'
          },
          {
            code: 'occupancy',
            to_ask: false,
            default_next_step: 'address',
            default_value: 'TENANT'
          },
          {
            code: 'address',
            default_next_step: 'room_count',
            to_ask: true
          },
          {
            code: 'room_count',
            default_next_step: 'SUBMIT',
            default_value: 1,
            options: [
              { value: 1 },
              { value: 2 },
              { value: 3 }
            ],
            to_ask: true
          },
          {
            code: 'roommate',
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
