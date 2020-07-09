import * as supertest from 'supertest'
import { dateFaker, expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'
import { PolicySqlModel } from '../../../../../src/app/policies/infrastructure/policy-sql.model'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { PolicyRepository } from '../../../../../src/app/policies/domain/policy.repository'
import { PolicySqlRepository } from '../../../../../src/app/policies/infrastructure/policy-sql.repository'
import { createPolicyFixture } from '../../../policies/fixtures/policy.fixture'

async function resetDb () {
  await PolicySqlModel.destroy({ truncate: true, cascade: true })
}

describe('Email Validations - API - E2E', async () => {
  let httpServer: HttpServerForTesting
  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('POST /internal/v0/email-validation/validate', async () => {
    let response: supertest.Response
    const now: Date = new Date('2020-08-12T00:00:00.000Z')
    const policyRepository: PolicyRepository = new PolicySqlRepository()

    before(async () => {
      // GIVEN
      dateFaker.setCurrentDate(now)
      const policy: Policy = createPolicyFixture({ id: 'APP746312047', emailValidationDate: undefined })
      await policyRepository.save(policy)
      const validUnexpiredToken: string =
          'LvzG5tpyGSc8m/hvZFlClWpBm8fsR8VZxZcxZOXcWSZm5z25OT1PoUKkXncKSJ58z4YnzvIyPPCJXf4hDaAl7sewepq1p2jENhd/Y9A6Hft7NJPaldA6w2Kgyz3JvicXqysO7t4RhC4GHUwnGto1Vtw/eJGdBrEE2Brg9Sdo1bMCXZsLMsIP+0GwQba41UpV'

      // WHEN
      response = await httpServer.api()
        .post('/internal/v0/email-validations/validate')
        .send({
          token: validUnexpiredToken
        })
    })

    after(async () => {
      await resetDb()
    })

    it('should return a callback URI', async () => {
      // THEN
      expect(response.body).to.deep.equal({ callback_url: 'http://bicycle-day.com' })
    })

    it('should update the policy email validation date', async () => {
      // THEN
      const updatedPolicy: Policy = await policyRepository.get('APP746312047')
      expect(updatedPolicy.emailValidationDate).to.deep.equal(now)
    })
  })
})
