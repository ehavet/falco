import * as supertest from 'supertest'
import { HttpServerForTesting, newMinimalServer } from '../../../utils/server.test-utils'
import { expect, sinon } from '../../../test-utils'
import { container, commonApiRoutes } from '../../../../src/app/common-api/common-api.container'

describe('Version - API - Integ', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(commonApiRoutes())
  })

  describe('GET /version', () => {
    let response: supertest.Response

    describe('when success', () => {
      const expectedApplicationVersion = { version: '1.1.11' }

      beforeEach(async () => {
        sinon.stub(container, 'GetApplicationVersion').resolves(expectedApplicationVersion)
        response = await httpServer.api()
          .get('/version')
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return an application version object', async () => {
        expect(response.body).to.deep.equal(expectedApplicationVersion)
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        sinon.stub(container, 'GetApplicationVersion').rejects(Error)
        response = await httpServer.api()
          .get('/version')

        expect(response).to.have.property('statusCode', 500)
      })
    })
  })
})
