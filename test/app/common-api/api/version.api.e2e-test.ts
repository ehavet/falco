import * as supertest from 'supertest'
import { HttpServerForTesting, newProdLikeServer } from '../../../utils/server.test-utils'
import { expect } from '../../../test-utils'

describe('Version - API - E2E', async () => {
  let httpServer: HttpServerForTesting
  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('GET /version', () => {
    let response: supertest.Response

    it('should return an application version resource', async () => {
      const { version } = require('../../../../package.json')
      const expectedResource = { version: version }
      response = await httpServer.api()
        .get('/version')
      expect(response.body).to.deep.equal(expectedResource)
    })
  })
})
