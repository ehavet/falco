import * as supertest from 'supertest'
import { expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'
import { PropertySqlModel } from '../../../../../src/app/properties/infrastructure/model/property-sql.model'

describe('Http API properties e2e', async () => {
  let httpServer: HttpServerForTesting

  const propertySQLFixture1 = {
    id: 1,
    name: 'T1'
  }

  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('GET /v0/properties', () => {
    let response: supertest.Response

    it('returns a list of properties', async () => {
      // GIVEN
      await PropertySqlModel.upsert(propertySQLFixture1)
      const expectedProperties = { properties: [{ id: 1, name: 'T1' }] }

      // WHEN
      response = await httpServer.api().get('/v0/properties')

      // THEN
      expect(response.body).to.deep.equal(expectedProperties)
    })
  })
})
