import * as supertest from 'supertest'
import { HttpServerForTesting, newMinimalServer } from '../../../../utils/server.test-utils'
import { container, pricingRoutes } from '../../../../../src/app/pricing/pricing.container'
import { expect, sinon } from '../../../../test-utils'
import { ComputePriceWithOperationCodeCommand } from '../../../../../src/app/pricing/domain/compute-price-with-operation-code-command'
import { PolicyNotFoundError } from '../../../../../src/app/policies/domain/policies.errors'
import { PartnerNotFoundError } from '../../../../../src/app/partners/domain/partner.errors'
import { OperationCodeNotApplicableError } from '../../../../../src/app/pricing/domain/operation-code.errors'

describe('Pricing - API - Integration', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(pricingRoutes())
  })

  describe('POST /v0/price', async () => {
    let response: supertest.Response

    describe('when success', () => {
      const price = {
        premium: 50,
        nbMonthsDue: 5,
        monthlyPrice: 10
      }

      const expectedResourcePrice = {
        premium: 50,
        nb_months_due: 5,
        monthly_price: 10
      }

      const command: ComputePriceWithOperationCodeCommand = {
        policyId: 'APP854732081',
        operationCode: 'SEMESTER1'
      }

      beforeEach(async () => {
        sinon.stub(container, 'ComputePriceWithOperationCode')
          .withArgs(command)
          .resolves(price)

        response = await httpServer.api()
          .post('/v0/price')
          .send({
            policy_id: 'APP854732081',
            spec_ops_code: 'SEMESTER1'
          })
      })

      it('should reply with status 201', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return a price', async () => {
        expect(response.body).to.deep.equal(expectedResourcePrice)
      })
    })

    describe('when the policy is not found', () => {
      it('should reply with status 404', async () => {
        const command: ComputePriceWithOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        const policyId: string = 'p0l1cy1d'
        sinon.stub(container, 'ComputePriceWithOperationCode')
          .withArgs(command)
          .rejects(new PolicyNotFoundError(policyId))

        response = await httpServer.api()
          .post('/v0/price')
          .send({
            policy_id: 'APP854732081',
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${policyId}`)
      })
    })

    describe('when the partner is not found', () => {
      it('should reply with status 404', async () => {
        const command: ComputePriceWithOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        sinon.stub(container, 'ComputePriceWithOperationCode')
          .withArgs(command)
          .rejects(new PartnerNotFoundError('Partner'))

        response = await httpServer.api()
          .post('/v0/price')
          .send({
            policy_id: 'APP854732081',
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Could not find partner with code : Partner')
      })
    })

    describe('when the special operation code is not applicable', () => {
      it('should reply with status 422', async () => {
        const command: ComputePriceWithOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        sinon.stub(container, 'ComputePriceWithOperationCode')
          .withArgs(command)
          .rejects(new OperationCodeNotApplicableError('SEMESTER1', 'Partner'))

        response = await httpServer.api()
          .post('/v0/price')
          .send({
            policy_id: 'APP854732081',
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'The operation code SEMESTER1 is not applicable for partner : Partner')
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        const command: ComputePriceWithOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        sinon.stub(container, 'ComputePriceWithOperationCode')
          .withArgs(command)
          .rejects(new Error())

        response = await httpServer.api()
          .post('/v0/price')
          .send({
            policy_id: 'APP854732081',
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when wrong spec ops code format', async () => {
        response = await httpServer.api()
          .post('/v0/price')
          .send({
            policy_id: 'APP854732081',
            spec_ops_code: 'SEMESTER1SEMESTER1SEMESTER1SEMESTER1SEMESTER1SEMESTER1S' +
                'SEMESTER1SEMESTER1SEMESTER1SEMESTER1SEMESTER1EMESTER1SEMESTER1SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })
})
