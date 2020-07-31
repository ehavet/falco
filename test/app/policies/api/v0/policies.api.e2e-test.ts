import * as supertest from 'supertest'
import { createPolicyFixture } from '../../fixtures/policy.fixture'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { config, dateFaker, expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'
import { PolicySqlModel } from '../../../../../src/app/policies/infrastructure/policy-sql.model'
import { createPolicyApiRequestFixture } from '../../fixtures/createPolicyApiRequest.fixture'
import { QuoteSqlModel } from '../../../../../src/app/quotes/infrastructure/quote-sql.model'
import { PolicySqlRepository } from '../../../../../src/app/policies/infrastructure/policy-sql.repository'
import { PolicyRepository } from '../../../../../src/app/policies/domain/policy.repository'
import fsx from 'fs-extra'

async function resetDb () {
  await PolicySqlModel.destroy({ truncate: true, cascade: true })
  await QuoteSqlModel.destroy({ truncate: true })
}

describe('Policies - API - E2E', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newProdLikeServer()
  })

  afterEach(async () => {
    await resetDb()
  })

  describe('POST /v0/policies/:id/payment-intents', async () => {
    let response: supertest.Response
    let policyRepository: PolicySqlRepository

    before(async () => {
      policyRepository = new PolicySqlRepository()
      const policy: Policy = createPolicyFixture(
        {
          id: 'APP463109486',
          premium: 99.99
        }
      )
      await policyRepository.save(policy)
    })

    it('should return a payment intent id', async () => {
      response = await httpServer.api()
        .post('/v0/policies/APP463109486/payment-intents')

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
          product_code: 'APP658',
          product_version: '2020-07-15',
          contractual_terms: '/docs/Appenin_Conditions_Generales_assurance_habitation_APP658.pdf',
          ipid: '/docs/Appenin_Document_Information_assurance_habitation_APP658.pdf'
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

    it('should save the policy', async () => {
      // Then
      const savedPolicy = await PolicySqlModel.findByPk(response.body.id)
      expect(savedPolicy).to.be.instanceOf(PolicySqlModel)
    })
  })

  describe('GET /v0/policies/:id', async () => {
    it('should return the found policy', async () => {
      // Given
      const policyId: string = 'APP105944294'
      const policyRepository: PolicyRepository = new PolicySqlRepository()
      const expectedPolicy: Policy = createPolicyFixture({ id: policyId })
      await policyRepository.save(expectedPolicy)

      // When
      const response = await httpServer.api().get(`/v0/policies/${policyId}`).set('X-Consumer-Username', 'myPartner')

      // Then
      const expectedResourcePolicy = {
        id: 'APP105944294',
        code: 'myPartner',
        insurance: {
          monthly_price: 5.82,
          default_deductible: 150,
          default_ceiling: 7000,
          currency: 'EUR',
          simplified_covers: ['ACDDE', 'ACVOL'],
          product_code: 'MRH-Loc-Etud',
          product_version: 'v2020-02-01',
          contractual_terms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid'
        },
        risk: {
          property: {
            room_count: 2,
            address: '13 rue du loup garou',
            postal_code: 91100,
            city: 'Corbeil-Essones'
          },
          people: {
            policy_holder: {
              firstname: 'Jean',
              lastname: 'Dupont'
            },
            other_insured: [{ firstname: 'John', lastname: 'Doe' }]
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
        premium: 69.84,
        start_date: '2020-01-05',
        term_start_date: '2020-01-05',
        term_end_date: '2020-01-05',
        subscription_date: '2020-01-05T10:09:08.000Z',
        signature_date: '2020-01-05T10:09:08.000Z',
        payment_date: '2020-01-05T10:09:08.000Z',
        status: 'INITIATED'
      }
      expect(response.body).to.deep.equal(expectedResourcePolicy)
    })
  })

  describe('PATCH /v0/policies/:id', async () => {
    it('should update the policy price and dates', async () => {
      // Given
      const policyId: string = 'APP105944294'
      const policyRepository: PolicyRepository = new PolicySqlRepository()
      const expectedPolicy: Policy = createPolicyFixture({ id: policyId, partnerCode: 'essca' })
      await policyRepository.save(expectedPolicy)

      // When
      await httpServer.api().patch(`/v0/policies/${policyId}`)
        .send({ spec_ops_code: 'SEMESTER1', start_date: '2020-04-05' })
        .set('X-Consumer-Username', 'essca')

      // Then
      const updatedPolicy = await PolicySqlModel.findByPk(policyId)
      expect(updatedPolicy.premium).to.equal(29.1)
      expect(updatedPolicy.nbMonthsDue).to.equal(5)
      expect(updatedPolicy.startDate).to.equal('2020-04-05')
      expect(updatedPolicy.termStartDate).to.equal('2020-04-05')
      expect(updatedPolicy.termEndDate).to.equal('2020-09-04')
    })
  })

  describe('POST /v0/policies/:id/certificates', async () => {
    let response: supertest.Response
    const now = new Date('2020-04-18T10:09:08Z')
    const policy: Policy = createPolicyFixture({ status: Policy.Status.Applicable })
    const policyRepository: PolicyRepository = new PolicySqlRepository()

    beforeEach(async () => {
      dateFaker.setCurrentDate(now)
      await policyRepository.save(policy)
    })

    it('should return certificate', async () => {
      // When
      response = await httpServer.api()
        .post(`/v0/policies/${policy.id}/certificates`)
        .send()
        .set('X-Consumer-Username', 'myPartner')

      // Then
      expect(response.header['content-length']).to.equal('123287')
      expect(response.header['content-disposition']).to.includes('Appenin_Attestation_assurance_habitation_APP753210859.pdf')
      expect(response.body).to.be.instanceOf(Buffer)
    })
  })

  describe('POST /v0/policies/:id/signature-request', async () => {
    let response: supertest.Response
    const policy: Policy = createPolicyFixture({ status: Policy.Status.Initiated, partnerCode: 'studyo' })
    const policyRepository: PolicyRepository = new PolicySqlRepository()

    beforeEach(async () => {
      await policyRepository.save(policy)
    })

    afterEach(async () => {
      await fsx.emptyDir(config.get('FALCO_API_DOCUMENTS_STORAGE_FOLDER'))
    })

    it('should return signature request url', async () => {
      // When
      response = await httpServer.api()
        .post(`/v0/policies/${policy.id}/signature-request`)
        .send()
        .set('X-Consumer-Username', 'studyo')
      // Then
      expect(response.body.url).to.include(('https://app.hellosign.com/editor/embeddedSign?signature_id='))
    }).timeout(10000)
  })
})
