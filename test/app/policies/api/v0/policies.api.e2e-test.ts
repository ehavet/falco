import * as supertest from 'supertest'
import { createPolicyFixture } from '../../fixtures/policy.fixture'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { config, dateFaker, expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'
import { PolicySqlModel } from '../../../../../src/app/policies/infrastructure/policy-sql.model'
import { createPolicyApiRequestFixture } from '../../fixtures/createPolicyApiRequest.fixture'
import { PolicySqlRepository } from '../../../../../src/app/policies/infrastructure/policy-sql.repository'
import { PolicyRepository } from '../../../../../src/app/policies/domain/policy.repository'
import fsx from 'fs-extra'
import { QuoteSqlModel } from '../../../../../src/app/quotes/infrastructure/sql-models/quote-sql-model'
import { PropertyType } from '../../../../../src/app/common-api/domain/type/property-type'
import { clearPricingZoneSqlFixture, setPricingZoneSqlFixture } from '../../../quotes/fixtures/pricing-zone.sql.fixture'
import { clearPricingMatrixSqlFixture, setPricingMatrixSqlFixture } from '../../../quotes/fixtures/pricing-matrix.sql.fixture'
import { Occupancy } from '../../../../../src/app/common-api/domain/type/occupancy'

async function resetDb () {
  await PolicySqlModel.destroy({ truncate: true, cascade: true })
  await QuoteSqlModel.destroy({ truncate: true })
}

describe('Policies - API v0 - E2E', async () => {
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

    beforeEach(async () => {
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
    const now = new Date('2020-04-18T00:00:00Z')
    const productCode = 'APP999'
    const partnerCode = 'demo-student'
    const requestParams: any = createPolicyApiRequestFixture({ code: partnerCode })

    beforeEach(async () => {
      // Given
      dateFaker.setCurrentDate(now)
      await setPricingZoneSqlFixture(productCode, 'Paris', '75000')
      await setPricingMatrixSqlFixture(partnerCode, 2)

      response = await httpServer.api()
        .post('/v0/quotes')
        .send({
          code: 'demo-student',
          risk: {
            property: {
              room_count: 2,
              address: '88 rue des prairies',
              postal_code: '75000',
              city: 'Paris',
              type: 'FLAT',
              occupancy: 'TENANT'
            }
          }
        })
        .set('X-Consumer-Username', 'studyo')

      requestParams.quote_id = response.body.id

      // When
      response = await httpServer.api()
        .post('/v0/policies')
        .send(requestParams)
        .set('X-Consumer-Username', 'studyo')
    })

    afterEach(async () => {
      await clearPricingZoneSqlFixture()
      await clearPricingMatrixSqlFixture()
    })

    it('should return the policy', async () => {
      // Given
      const expectedPolicy = {
        id: 'MYP936794823',
        code: partnerCode,
        insurance: {
          monthly_price: 3.82,
          default_deductible: 120,
          default_ceiling: 5000,
          currency: 'EUR',
          simplified_covers: ['ACDDE', 'ACINCEX', 'ACVOL', 'ACASSHE', 'ACDEFJU', 'ACRC'],
          product_code: productCode,
          product_version: '2020-09-11',
          contractual_terms: '/docs/Appenin_Conditions_Generales_assurance_habitation_APP999.pdf',
          ipid: '/docs/Appenin_Document_Information_assurance_habitation_APP999.pdf'
        },
        risk: {
          property: {
            room_count: 2,
            address: '88 rue des prairies',
            postal_code: '75000',
            city: 'Paris',
            type: PropertyType.FLAT,
            occupancy: Occupancy.TENANT
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
          address: '88 rue des prairies',
          postal_code: '75000',
          city: 'Paris',
          email: 'jeandupont@email.com',
          phone_number: '+33684205510'
        },
        nb_months_due: 12,
        premium: 45.84,
        start_date: '2020-04-05',
        term_start_date: '2020-04-05',
        term_end_date: '2021-04-04',
        subscription_date: null,
        signature_date: null,
        special_operations_code: null,
        special_operations_code_applied_at: null,
        payment_date: null,
        email_validated: false,
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
          product_code: 'APP999',
          product_version: 'v2020-02-01',
          contractual_terms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid'
        },
        risk: {
          property: {
            room_count: 2,
            address: '13 rue du loup garou',
            postal_code: '91100',
            city: 'Corbeil-Essonnes',
            type: PropertyType.FLAT,
            occupancy: Occupancy.TENANT
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
          postal_code: '91100',
          city: 'Corbeil-Essonnes',
          email: 'jeandupont@email.com',
          phone_number: '+33684205510'
        },
        nb_months_due: 12,
        premium: 69.84,
        start_date: '2020-01-05',
        term_start_date: '2020-01-05',
        term_end_date: '2020-01-05',
        subscription_date: '2020-01-05T00:00:00.000Z',
        signature_date: '2020-01-05T00:00:00.000Z',
        payment_date: '2020-01-05T00:00:00.000Z',
        special_operations_code: null,
        special_operations_code_applied_at: null,
        email_validated: true,
        status: 'INITIATED'
      }
      expect(response.body).to.deep.equal(expectedResourcePolicy)
    })
  })

  describe('POST /v0/policies/:id/certificates', async () => {
    // Given
    let response: supertest.Response
    const now = new Date('2020-04-18T00:00:00Z')
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
      expect(response.header['content-length']).to.equal('123947')
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
    }).timeout(15000)
  })

  describe('POST /v0/policies/:id/apply-spec-ops-code', async () => {
    it('should apply special operation code on policies', async () => {
      // Given
      const policyRepository = new PolicySqlRepository()
      const policyId = 'APP123456789'
      const initialPolicy: Policy = createPolicyFixture(
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
            productCode: 'APP999',
            productVersion: 'v2020-02-01',
            contractualTerms: '/path/to/contractual/terms',
            ipid: '/path/to/ipid'
          },
          premium: 120,
          nbMonthsDue: 12
        }
      )
      dateFaker.setCurrentDate(new Date('2020-01-05T00:00:00.000Z'))
      await policyRepository.save(initialPolicy)
      // When
      const response = await httpServer.api()
        .post(`/v0/policies/${policyId}/apply-spec-ops-code`)
        .send({
          spec_ops_code: 'SEMESTER1'
        })
      // Then
      const expectedResourcePolicy = {
        id: 'APP123456789',
        code: 'essca',
        insurance: {
          monthly_price: 10,
          default_deductible: 150,
          default_ceiling: 7000,
          currency: 'EUR',
          simplified_covers: ['ACDDE', 'ACVOL'],
          product_code: 'APP999',
          product_version: 'v2020-02-01',
          contractual_terms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid'
        },
        risk: {
          property: {
            room_count: 2,
            address: '13 rue du loup garou',
            postal_code: '91100',
            city: 'Corbeil-Essonnes',
            type: PropertyType.FLAT,
            occupancy: Occupancy.TENANT
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
          postal_code: '91100',
          city: 'Corbeil-Essonnes',
          email: 'jeandupont@email.com',
          phone_number: '+33684205510'
        },
        nb_months_due: 5,
        premium: 50,
        start_date: '2020-01-05',
        term_end_date: '2020-06-04',
        term_start_date: '2020-01-05',
        subscription_date: '2020-01-05T00:00:00.000Z',
        signature_date: '2020-01-05T00:00:00.000Z',
        payment_date: '2020-01-05T00:00:00.000Z',
        email_validated: true,
        status: 'INITIATED',
        special_operations_code: 'SEMESTER1',
        special_operations_code_applied_at: '2020-01-05T00:00:00.000Z'
      }
      expect(response.body).to.deep.equal(expectedResourcePolicy)
    })
  })

  describe('POST /v0/policies/:id/change-start-date', async () => {
    const now = new Date('2020-07-13T00:00:00Z')

    beforeEach(async () => {
      dateFaker.setCurrentDate(now)
    })

    it('should apply new start date to policy', async () => {
      // Given
      const policyRepository = new PolicySqlRepository()
      const policyId = 'APP123456789'
      const initialPolicy: Policy = createPolicyFixture({ id: policyId })
      await policyRepository.save(initialPolicy)
      // When
      const response = await httpServer.api()
        .post(`/v0/policies/${policyId}/change-start-date`)
        .send({
          start_date: '2020-07-13'
        })
      // Then
      const expectedResourcePolicy = {
        id: 'APP123456789',
        code: 'myPartner',
        insurance: {
          monthly_price: 5.82,
          default_deductible: 150,
          default_ceiling: 7000,
          currency: 'EUR',
          simplified_covers: ['ACDDE', 'ACVOL'],
          product_code: 'APP999',
          product_version: 'v2020-02-01',
          contractual_terms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid'
        },
        risk: {
          property: {
            room_count: 2,
            address: '13 rue du loup garou',
            postal_code: '91100',
            city: 'Corbeil-Essonnes',
            type: PropertyType.FLAT,
            occupancy: Occupancy.TENANT
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
          postal_code: '91100',
          city: 'Corbeil-Essonnes',
          email: 'jeandupont@email.com',
          phone_number: '+33684205510'
        },
        nb_months_due: 12,
        premium: 69.84,
        start_date: '2020-07-13',
        term_end_date: '2021-07-12',
        term_start_date: '2020-07-13',
        subscription_date: '2020-01-05T00:00:00.000Z',
        signature_date: '2020-01-05T00:00:00.000Z',
        payment_date: '2020-01-05T00:00:00.000Z',
        email_validated: true,
        special_operations_code: null,
        special_operations_code_applied_at: null,
        status: 'INITIATED'
      }
      expect(response.body).to.deep.equal(expectedResourcePolicy)
    })
  })
})
