import * as supertest from 'supertest'
import { HttpServerForTesting, newMinimalServer } from '../../../../utils/server.test-utils'
import { container, healthChecksRoutes } from '../../../../../src/app/health-checks/health-checks.container'
import { expect, sinon } from '../../../../test-utils'

describe('Health Check - API - Integ', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(healthChecksRoutes())
  })

  describe('GET /internal/v0/health-checks/readiness', () => {
    let response: supertest.Response

    describe('when application state is up', () => {
      beforeEach(async () => {
        sinon.stub(container, 'CheckApplicationReadiness').resolves(true)
        response = await httpServer.api().get('/internal/v0/health-checks/readiness')
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return an application state UP', async () => {
        expect(response.body).to.deep.equal({ state: 'UP' })
      })
    })

    describe('when application state is down', () => {
      beforeEach(async () => {
        sinon.stub(container, 'CheckApplicationReadiness').resolves(false)
        response = await httpServer.api().get('/internal/v0/health-checks/readiness')
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return an application state DOWN', async () => {
        expect(response.body).to.deep.equal({ state: 'DOWN' })
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        sinon.stub(container, 'CheckApplicationReadiness').rejects(new Error())

        response = await httpServer.api().get('/internal/v0/health-checks/readiness')

        expect(response).to.have.property('statusCode', 500)
      })
    })
  })
})
