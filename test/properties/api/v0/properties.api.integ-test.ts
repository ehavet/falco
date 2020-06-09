import * as supertest from 'supertest'
import { expect, sinon, HttpServerForTesting, newMinimalServer } from '../../../test-utils'
import { container, propertiesRoutes } from '../../../../src/properties/properties.container'

describe('Http API properties integ', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(propertiesRoutes())
  })

  describe('GET /v0/properties', () => {
    let response: supertest.Response
    const expectedProperties = { properties: [{ id: 1, name: 'T1' }, { id: 2, name: 'T2' }] }

    describe('when success', () => {
      beforeEach(async () => {
        sinon.stub(container, 'GetProperties').resolves(expectedProperties)
        response = await httpServer.api().get('/v0/properties')
      })

      it('replies with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('return a list of properties', async () => {
        expect(response.body).to.deep.equal(expectedProperties)
      })
    })
  })
})
