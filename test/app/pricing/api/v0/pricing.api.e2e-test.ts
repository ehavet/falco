import { HttpServerForTesting, newProdLikeServer } from '../../../../utils/server.test-utils'
import { PolicySqlRepository } from '../../../../../src/app/policies/infrastructure/policy-sql.repository'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { createPolicyFixture } from '../../../policies/fixtures/policy.fixture'
import { expect } from '../../../../test-utils'
import { PolicySqlModel } from '../../../../../src/app/policies/infrastructure/policy-sql.model'

async function resetDb () {
  await PolicySqlModel.destroy({ truncate: true, cascade: true })
}

describe('Pricing - API - E2E', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newProdLikeServer()
  })

  after(async () => {
    await resetDb()
  })

  describe('POST /v0/price', async () => {
    it('should apply special operation code on price', async () => {
      // Given
      const policyRepository = new PolicySqlRepository()
      const policyId = 'APP123456789'
      const policy: Policy = createPolicyFixture(
        {
          id: policyId,
          partnerCode: 'essca',
          insurance: {
            estimate: {
              monthlyPrice: 10,
              defaultDeductible: 150,
              defaultCeiling: 7000
            },
            currency: 'EUR',
            simplifiedCovers: ['ACDDE', 'ACVOL'],
            productCode: 'MRH-Loc-Etud',
            productVersion: 'v2020-02-01',
            contractualTerms: '/path/to/contractual/terms',
            ipid: '/path/to/ipid'
          },
          premium: 120,
          nbMonthsDue: 12
        }
      )
      await policyRepository.save(policy)
      // When
      const response = await httpServer.api()
        .post('/v0/price')
        .send({
          policy_id: policyId,
          spec_ops_code: 'SEMESTER1'
        })

      // Then
      expect(response.body).to.deep.equal({
        premium: 50,
        nb_months_due: 5,
        monthly_price: 10
      })
    })
  })
})
