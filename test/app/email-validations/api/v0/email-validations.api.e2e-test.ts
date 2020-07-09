import * as supertest from 'supertest'
import { expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'

describe('Http API email validations e2e', async () => {
  let httpServer: HttpServerForTesting
  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('POST /internal/v0/email-validation/validate', async () => {
    let response: supertest.Response

    it('should return a callback URI', async () => {
      // GIVEN
      const validUnexpiredToken: string =
          'RibdLLppjhpKAqrcTsT1KxQWH70WcFoOPIuSvHJXdtzDQUDmZxk1SnDNmXFIfcJLBhlVCk8+uJoDVUJreeHEhIoQ2Bc4ARbFWnADoJ1AEM/vgfhZwchBJRqI16CrPa39vqyWPfK0cFIYBgV313oVhg=='
      // WHEN
      response = await httpServer.api()
        .post('/internal/v0/email-validations/validate')
        .send({
          token: validUnexpiredToken
        })

      // THEN
      expect(response.body).to.deep.equal({ callback_url: 'http://callback.url.com' })
    })
  })
})
