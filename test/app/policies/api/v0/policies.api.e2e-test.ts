import * as supertest from 'supertest'
import { createPolicyFixture } from '../../fixtures/policy.fixture'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { dateFaker, expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'
import { PolicySqlModel } from '../../../../../src/app/policies/infrastructure/policy-sql.model'
import { createPolicyApiRequestFixture } from '../../fixtures/createPolicyApiRequest.fixture'
import { QuoteSqlModel } from '../../../../../src/app/quotes/infrastructure/quote-sql.model'
import { PolicySqlRepository } from '../../../../../src/app/policies/infrastructure/policy-sql.repository'

async function resetDb () {
  await PolicySqlModel.destroy({ truncate: true, cascade: true })
  await QuoteSqlModel.destroy({ truncate: true })
}

describe('Policies - API - E2E', async () => {
  let httpServer: HttpServerForTesting

  describe('POST /v0/policies/:id/payment-intents', async () => {
    let response: supertest.Response
    let policyRepository: PolicySqlRepository

    before(async () => {
      policyRepository = new PolicySqlRepository()
      const policy: Policy = createPolicyFixture(
        {
          id: 'P0l1CY1D',
          premium: 99.99
        }
      )
      await policyRepository.save(policy)
      httpServer = await newProdLikeServer()
    })

    afterEach(async () => {
      await resetDb()
    })

    it('should return a payment intent id', async () => {
      response = await httpServer.api()
        .post('/v0/policies/P0l1CY1D/payment-intents')

      // THEN
      expect(response.body)
        .to.include({ amount: 99.99, currency: 'eur' })
        .to.have.property('id')
      expect(response.body.id)
        .to.include('pi_')
        .to.include('_secret_')
    }).timeout(10000)
  })

  describe('POST /v0/policies', async () => {
    let response: supertest.Response
    const now = new Date('2020-04-18T10:09:08Z')
    const requestParams: any = createPolicyApiRequestFixture({ code: 'studyo' })

    beforeEach(async () => {
      // Given
      dateFaker.setCurrentDate(now)
      response = await httpServer.api()
        .post('/v0/quotes')
        .send({ code: 'studyo', risk: { property: { room_count: 2 } } })
        .set('X-Consumer-Username', 'studyo')

      const quoteId: string = response.body.id
      requestParams.quote_id = quoteId

      // When
      response = await httpServer.api()
        .post('/v0/policies')
        .send(requestParams)
        .set('X-Consumer-Username', 'myPartner')
    })

    afterEach(async () => {
      await resetDb()
    })

    it('should return the policy', async () => {
      // Given
      const expectedPolicy = {
        id: 'MYP936794823',
        code: 'studyo',
        insurance: {
          monthly_price: 7.5,
          default_deductible: 120,
          default_ceiling: 5000,
          currency: 'EUR',
          simplified_covers: ['ACDDE', 'ACINCEX', 'ACVOL', 'ACASSHE', 'ACDEFJU', 'ACRC'],
          product_code: 'MRH_Etudiant',
          product_version: '1.0'
        },
        risk: {
          property: {
            room_count: 2,
            address: '13 rue du loup garou',
            postal_code: 91100,
            city: 'Corbeil-Essones'
          },
          people: {
            other_insured: [
              {
                firstname: 'John',
                lastname: 'Doe'
              }
            ],
            policy_holder: {
              firstname: 'Jean',
              lastname: 'Dupont'
            }
          }
        },
        contact: {
          lastname: 'Dupont',
          firstname: 'Jean',
          address: '13 rue du loup garou',
          postal_code: 91100,
          city: 'Corbeil-Essones',
          email: 'jeandupont@email.com',
          phone_number: '+33684205510'
        },
        nb_months_due: 12,
        premium: 90,
        start_date: '2020-04-05',
        term_start_date: '2020-04-05',
        term_end_date: '2021-04-04',
        subscription_date: null,
        signature_date: null,
        payment_date: null,
        status: 'INITIATED'
      }

      // Then
      expectedPolicy.id = response.body.id
      expect(response.body).to.deep.equal(expectedPolicy)
    })

    it('should save the quote', async () => {
      // Then
      const savedPolicy = await PolicySqlModel.findByPk(response.body.id)
      expect(savedPolicy).to.be.instanceOf(PolicySqlModel)
    })
  })
})
