import { HttpServerForTesting, newMinimalServer } from '../../../../utils/server.test-utils'
import { container, policiesRoutes } from '../../../../../src/app/policies/policies.container'
import * as supertest from 'supertest'
import { expect, sinon } from '../../../../test-utils'
import {
  PolicyAlreadySignedError,
  PolicyNotFoundError,
  PolicyNotUpdatableError,
  PolicyStartDateConsistencyError,
  PolicyCanceledError,
  PolicyAlreadyPaidError,
  PolicyHolderMissingError,
  PolicyRiskPersonMissingError,
  PolicyHolderEmailValidationError,
  PolicyHolderMissingPropertyError,
  PolicyRiskPropertyMissingFieldError, CreatePolicyQuotePartnerOwnershipError
} from '../../../../../src/app/policies/domain/policies.errors'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { createOngoingPolicyFixture, createPolicyFixture } from '../../fixtures/policy.fixture'
import { createPolicyApiRequestFixture, createPolicyApiRequestFixtureV1 } from '../../fixtures/createPolicyApiRequest.fixture'
import { QuoteNotFoundError } from '../../../../../src/app/quotes/domain/quote.errors'
import { GetPolicyQuery } from '../../../../../src/app/policies/domain/get-policy-query'
import { Certificate } from '../../../../../src/app/policies/domain/certificate/certificate'
import { SignatureRequest } from '../../../../../src/app/policies/domain/signature-request'
import { ContractGenerationFailureError, SignatureRequestCreationFailureError, SpecificTermsGenerationFailureError } from '../../../../../src/app/policies/domain/signature-request.errors'
import { SpecificTerms } from '../../../../../src/app/policies/domain/specific-terms/specific-terms'
import { SpecificTermsNotFoundError } from '../../../../../src/app/policies/domain/specific-terms/specific-terms.errors'
import { OperationCodeNotApplicableError } from '../../../../../src/app/policies/domain/operation-code.errors'
import { ApplySpecialOperationCodeCommand } from '../../../../../src/app/policies/domain/apply-special-operation-code-command'
import { PartnerNotFoundError } from '../../../../../src/app/partners/domain/partner.errors'
import { ApplyStartDateOnPolicyCommand } from '../../../../../src/app/policies/domain/apply-start-date-on-policy.usecase'
import { PolicyForbiddenCertificateGenerationError } from '../../../../../src/app/policies/domain/certificate/certificate.errors'
import { CreatePolicyForQuoteCommand } from '../../../../../src/app/policies/domain/create-policy-for-quote-command'
import { PropertyType } from '../../../../../src/app/common-api/domain/type/property-type'
import { Occupancy } from '../../../../../src/app/common-api/domain/type/occupancy'

describe('Policies - API v1 - Integration', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(policiesRoutes())
  })

  describe('POST /v1/policies/:id/payment-intents', async () => {
    let response: supertest.Response

    describe('when success', () => {
      const expectedPaymentIntent = {
        id: 'pi_P4Ym3NtInT3nt1d',
        amount: 66.66,
        currency: 'eur'
      }

      beforeEach(async () => {
        sinon.stub(container, 'CreatePaymentIntentForPolicy')
          .withArgs({ policyId: 'p0l1cy1d' })
          .resolves(expectedPaymentIntent)

        response = await httpServer.api()
          .post('/v1/policies/p0l1cy1d/payment-intents')
      })

      it('should reply with status 201', async () => {
        expect(response).to.have.property('statusCode', 201)
      })

      it('should return a payment intent id', async () => {
        expect(response.body).to.deep.equal(expectedPaymentIntent)
      })
    })

    describe('when the policy is not found', () => {
      it('should reply with status 404', async () => {
        const policyId: string = 'p0l1cy1d'
        sinon.stub(container, 'CreatePaymentIntentForPolicy')
          .withArgs({ policyId: policyId })
          .rejects(new PolicyNotFoundError(policyId))

        response = await httpServer.api()
          .post('/v1/policies/p0l1cy1d/payment-intents')

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${policyId}`)
      })
    })

    describe('when the policy has been canceled', () => {
      it('should reply with status 409', async () => {
        const policyId: string = 'p0l1cy1d'
        sinon.stub(container, 'CreatePaymentIntentForPolicy')
          .withArgs({ policyId: policyId })
          .rejects(new PolicyCanceledError(policyId))

        response = await httpServer.api()
          .post('/v1/policies/p0l1cy1d/payment-intents')

        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', `The policy ${policyId} has been canceled`)
      })
    })

    describe('when the policy is already paid', () => {
      it('should reply with status 409', async () => {
        const policyId: string = 'p0l1cy1d'
        sinon.stub(container, 'CreatePaymentIntentForPolicy')
          .withArgs({ policyId: policyId })
          .rejects(new PolicyAlreadyPaidError(policyId))

        response = await httpServer.api()
          .post('/v1/policies/p0l1cy1d/payment-intents')

        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', `The policy ${policyId} has already been paid`)
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        sinon.stub(container, 'CreatePaymentIntentForPolicy')
          .withArgs({ policyId: 'p0l1cy1d' })
          .rejects(new Error())

        response = await httpServer.api()
          .post('/v1/policies/p0l1cy1d/payment-intents')

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when wrong policy id format', async () => {
        response = await httpServer.api()
          .post('/v1/policies/01234567890123456789' +
              '012345678901234567890123456789' +
              '012345678901234567890123456789' +
              '01234567890123456789_T00_L0NG_1D/payment-intents')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })

  describe('POST /v1/policies', async () => {
    let response: supertest.Response
    const requestParams: any = createPolicyApiRequestFixtureV1()

    describe('when the policy is created', async () => {
      const policy: Policy = createOngoingPolicyFixture({ emailValidationDate: new Date('2020-01-05T00:00:00.000Z') })
      const command: CreatePolicyForQuoteCommand = { partnerCode: 'myPartner', quoteId: requestParams.quote_id }

      beforeEach(async () => {
        // Given
        sinon.stub(container, 'CreatePolicyForQuote').withArgs(command).resolves(policy)

        // When
        response = await httpServer.api()
          .post('/v1/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 201', async () => {
        expect(response).to.have.property('statusCode', 201)
      })

      it('should return the created policy', async () => {
        const expectedResourcePolicy = {
          id: 'APP753210859',
          code: 'myPartner',
          insurance: {
            monthly_price: 5.82,
            default_deductible: 150,
            default_cap: 7000,
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
            person: {
              firstname: 'Jean',
              lastname: 'Dupont'
            },
            other_people: [{ firstname: 'John', lastname: 'Doe' }]
          },
          policy_holder: {
            lastname: 'Dupont',
            firstname: 'Jean',
            address: '13 rue du loup garou',
            postal_code: '91100',
            city: 'Corbeil-Essonnes',
            email: 'jeandupont@email.com',
            phone_number: '+33684205510',
            email_validated_at: '2020-01-05T00:00:00.000Z'
          },
          nb_months_due: 12,
          premium: 69.84,
          start_date: '2020-01-05',
          term_start_date: '2020-01-05',
          term_end_date: '2020-01-05',
          subscribed_at: null,
          signed_at: null,
          paid_at: null,
          special_operations_code: null,
          special_operations_code_applied_at: null,
          status: 'INITIATED'
        }

        expect(response.body).to.deep.equal(expectedResourcePolicy)
      })
    })

    describe('when the usecase throw an error', async () => {
      const errors = [
        { instance: new QuoteNotFoundError(requestParams.quote_id), expectedStatus: 404 },
        { instance: new PolicyHolderMissingError(requestParams.quote_id), expectedStatus: 422 },
        { instance: new PolicyRiskPersonMissingError(requestParams.quote_id), expectedStatus: 422 },
        { instance: new PolicyHolderMissingPropertyError(requestParams.quote_id, 'propertyName'), expectedStatus: 422 },
        { instance: new PolicyHolderEmailValidationError(requestParams.quote_id), expectedStatus: 422 },
        { instance: new PolicyRiskPropertyMissingFieldError(requestParams.quote_id, 'propertyName'), expectedStatus: 422 },
        { instance: new CreatePolicyQuotePartnerOwnershipError(requestParams.quote_id, 'myPartner'), expectedStatus: 422 }
      ]

      errors.forEach(async (error) => {
        it(`${error.instance.constructor.name} should return a ${error.expectedStatus} status`, async () => {
          // Given
          sinon.stub(container, 'CreatePolicyForQuote').rejects(error.instance)

          // When
          response = await httpServer.api()
            .post('/v1/policies')
            .send(requestParams)
            .set('X-Consumer-Username', 'myPartner')

          // Then
          expect(response).to.have.property('statusCode', error.expectedStatus)
        })
      })
    })

    describe('when there is an internal error', async () => {
      it('should return a 500', async () => {
        // Given
        sinon.stub(container, 'CreatePolicyForQuote').rejects(new Error())

        // When
        response = await httpServer.api()
          .post('/v1/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      let requestParams: any

      beforeEach(() => {
        requestParams = createPolicyApiRequestFixture()
      })

      it('should reply with status 400 when there is no quote_id', async () => {
        // Given
        delete requestParams.quote_id

        // When
        response = await httpServer.api()
          .post('/v1/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })

  describe('GET /v1/policies/:id', async () => {
    let response: supertest.Response

    describe('when the policy is found', async () => {
      before(async () => {
        // Given
        const policyId: string = 'APP105944294'
        const expectedPolicy: Policy = createPolicyFixture({ id: policyId })
        const getPolicyQuery: GetPolicyQuery = { policyId }
        sinon.stub(container, 'GetPolicy').withArgs(getPolicyQuery).resolves(expectedPolicy)

        // When
        response = await httpServer.api().get(`/v1/policies/${policyId}`).set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 200', async () => {
        // Then
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return the policy', async () => {
        // Then
        const expectedResourcePolicy = {
          id: 'APP105944294',
          code: 'myPartner',
          insurance: {
            monthly_price: 5.82,
            default_deductible: 150,
            default_cap: 7000,
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
            person: {
              firstname: 'Jean',
              lastname: 'Dupont'
            },
            other_people: [{ firstname: 'John', lastname: 'Doe' }]
          },
          policy_holder: {
            lastname: 'Dupont',
            firstname: 'Jean',
            address: '13 rue du loup garou',
            postal_code: '91100',
            city: 'Corbeil-Essonnes',
            email: 'jeandupont@email.com',
            phone_number: '+33684205510',
            email_validated_at: '2020-01-05T00:00:00.000Z'
          },
          nb_months_due: 12,
          premium: 69.84,
          start_date: '2020-01-05',
          term_start_date: '2020-01-05',
          term_end_date: '2020-01-05',
          subscribed_at: '2020-01-05T00:00:00.000Z',
          signed_at: '2020-01-05T00:00:00.000Z',
          paid_at: '2020-01-05T00:00:00.000Z',
          status: 'INITIATED',
          special_operations_code: null,
          special_operations_code_applied_at: null
        }
        expect(response.body).to.deep.equal(expectedResourcePolicy)
      })
    })

    describe('when there is an internal error', async () => {
      it('should reply with status 500', async () => {
        // Given
        const policyId: string = 'APP105944294'
        const getPolicyQuery: GetPolicyQuery = { policyId }
        sinon.stub(container, 'GetPolicy').withArgs(getPolicyQuery).rejects(new Error())

        // When
        const response = await httpServer.api().get(`/v1/policies/${policyId}`).set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when the policy is not found', () => {
      it('should reply with status 404', async () => {
        // Given
        const policyId: string = 'APP105944294'
        const getPolicyQuery: GetPolicyQuery = { policyId }
        sinon.stub(container, 'GetPolicy').withArgs(getPolicyQuery).rejects(new PolicyNotFoundError(policyId))

        // When
        const response = await httpServer.api().get(`/v1/policies/${policyId}`).set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${policyId}`)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id is not 12 characters', async () => {
        // When
        const response = await httpServer.api().get('/v1/policies/WRONG').set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })

  describe('POST /v1/policies/id/certificates', async () => {
    let response: supertest.Response

    describe('when the certificate is created', async () => {
      const certificate: Certificate = {
        name: 'Appenin_Attestation_assurance_habitation_APP753210859.pdf',
        buffer: Buffer.from('certificate')
      }

      beforeEach(async () => {
        // Given
        sinon.stub(container, 'GeneragePolicyCertificate').resolves(certificate)

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/certificates')
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 201', () => {
        expect(response).to.have.property('statusCode', 201)
        expect(response.type).to.equal('application/octet-stream')
      })

      it('should returns headers about the stream', () => {
        expect(response.header['content-type']).to.equal('application/octet-stream')
        expect(response.header['content-length']).to.equal('11')
        expect(response.header['content-disposition']).to.equal('attachment; filename=Appenin_Attestation_assurance_habitation_APP753210859.pdf')
      })

      it('should return the certificate as a buffer', () => {
        expect(response.body).to.deep.equal(certificate.buffer)
      })
    })

    describe('when the policy is not found', async () => {
      it('should return a 404', async () => {
        // Given
        sinon.stub(container, 'GeneragePolicyCertificate').rejects(new PolicyNotFoundError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/certificates')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Could not find policy with id : APP753210859')
      })
    })

    describe('when the policy has been canceled', async () => {
      it('should return a 409', async () => {
        // Given
        sinon.stub(container, 'GeneragePolicyCertificate').rejects(new PolicyCanceledError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/certificates')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', 'The policy APP753210859 has been canceled')
      })
    })

    describe('when the policy is not applicable yet', async () => {
      it('should return a 409', async () => {
        // Given
        sinon.stub(container, 'GeneragePolicyCertificate').rejects(new PolicyForbiddenCertificateGenerationError())

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/certificates')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', 'Could not generate the certificate because the policy is not applicable')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id has not 12 chars', async () => {
        // When
        response = await httpServer.api()
          .post('/v1/policies/APP3465/certificates')
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })

    describe('when there is an internal error', async () => {
      it('should return a 500', async () => {
        // Given
        sinon.stub(container, 'GeneragePolicyCertificate').rejects(new Error())

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/certificates')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })
  })

  describe('GET /v1/policies/id/specific-terms', async () => {
    let response: supertest.Response

    describe('when the specific terms are found', async () => {
      const specificTerms: SpecificTerms = {
        name: 'Appenin_Conditions_Particulieres_assurance_habitation_APP753210859.pdf',
        buffer: Buffer.from('specific terms')
      }

      beforeEach(async () => {
        // Given
        sinon.stub(container, 'GetPolicySpecificTerms').resolves(specificTerms)

        // When
        response = await httpServer.api()
          .get('/v1/policies/APP753210859/specific-terms')
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 200', () => {
        expect(response).to.have.property('statusCode', 200)
        expect(response.type).to.equal('application/octet-stream')
      })

      it('should returns headers about the stream', () => {
        expect(response.header['content-type']).to.equal('application/octet-stream')
        expect(response.header['content-length']).to.equal('14')
        expect(response.header['content-disposition']).to.equal('attachment; filename=Appenin_Conditions_Particulieres_assurance_habitation_APP753210859.pdf')
      })

      it('should return the certificate as a buffer', () => {
        expect(response.body).to.deep.equal(specificTerms.buffer)
      })
    })

    describe('when the specific terms are not found', async () => {
      it('should return a 404', async () => {
        // Given
        sinon.stub(container, 'GetPolicySpecificTerms').rejects(new SpecificTermsNotFoundError('name'))

        // When
        response = await httpServer.api()
          .get('/v1/policies/APP753210859/specific-terms')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Specific terms name not found')
      })
    })

    describe('when policy not found', async () => {
      it('should return a 404', async () => {
        // Given
        sinon.stub(container, 'GetPolicySpecificTerms').rejects(new PolicyNotFoundError('APP753210859'))

        // When
        response = await httpServer.api()
          .get('/v1/policies/APP753210859/specific-terms')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Could not find policy with id : APP753210859')
      })
    })

    describe('when policy has been canceled', async () => {
      it('should return a 409', async () => {
        // Given
        sinon.stub(container, 'GetPolicySpecificTerms').rejects(new PolicyCanceledError('APP753210859'))

        // When
        response = await httpServer.api()
          .get('/v1/policies/APP753210859/specific-terms')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', 'The policy APP753210859 has been canceled')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id has not 12 chars', async () => {
        // When
        response = await httpServer.api()
          .get('/v1/policies/APP7532159/specific-terms')
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })

    describe('when there is an internal error', async () => {
      it('should return a 500', async () => {
        // Given
        sinon.stub(container, 'GetPolicySpecificTerms').rejects(new Error())

        // When
        response = await httpServer.api()
          .get('/v1/policies/APP753210859/specific-terms')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })
  })

  describe('POST /v1/policies/id/signature-request', async () => {
    let response: supertest.Response

    describe('when success', async () => {
      const signatureRequest: SignatureRequest = {
        url: 'http://signature.url.com'
      }

      beforeEach(async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy')
          .withArgs('APP753210859').resolves(signatureRequest)

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 201', () => {
        expect(response).to.have.property('statusCode', 201)
        expect(response.body).to.deep.equal(signatureRequest)
      })
    })

    describe('when the policy is not found', async () => {
      it('should return a 404', async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy').rejects(new PolicyNotFoundError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Could not find policy with id : APP753210859')
      })
    })

    describe('when the signature request creation failed', async () => {
      it('should return a 500', async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy').rejects(new SignatureRequestCreationFailureError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when the terms generatioon failed', async () => {
      it('should return a 500', async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy').rejects(new SpecificTermsGenerationFailureError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when the contract generation failed', async () => {
      it('should return a 500', async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy').rejects(new ContractGenerationFailureError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when terms are not found failed', async () => {
      it('should return a 404', async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy').rejects(new SpecificTermsNotFoundError('specificTermsName'))

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Specific terms specificTermsName not found')
      })
    })

    describe('when the policy has been canceled', async () => {
      it('should return a 409', async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy').rejects(new PolicyCanceledError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', 'The policy APP753210859 has been canceled')
      })
    })

    describe('when the policy has already been signed', async () => {
      it('should return a 409', async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy').rejects(new PolicyAlreadySignedError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', 'The policy APP753210859 has already been signed')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id has not 12 chars', async () => {
        // When
        response = await httpServer.api()
          .post('/v1/policies/APP02/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })

    describe('when there is an internal error', async () => {
      it('should return a 500', async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy').rejects(new Error())

        // When
        response = await httpServer.api()
          .post('/v1/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })
  })

  describe('POST /v1/policies/id/apply-spec-ops-code', async () => {
    let response: supertest.Response

    describe('when success', () => {
      const policyId = 'APP854732081'
      const policy: Policy = createPolicyFixture({ id: policyId })

      const command: ApplySpecialOperationCodeCommand = {
        policyId: 'APP854732081',
        operationCode: 'SEMESTER1'
      }

      const expectedResourcePolicy = {
        id: 'APP854732081',
        code: 'myPartner',
        insurance: {
          monthly_price: 5.82,
          default_deductible: 150,
          default_cap: 7000,
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
          person: {
            firstname: 'Jean',
            lastname: 'Dupont'
          },
          other_people: [{ firstname: 'John', lastname: 'Doe' }]
        },
        policy_holder: {
          lastname: 'Dupont',
          firstname: 'Jean',
          address: '13 rue du loup garou',
          postal_code: '91100',
          city: 'Corbeil-Essonnes',
          email: 'jeandupont@email.com',
          phone_number: '+33684205510',
          email_validated_at: '2020-01-05T00:00:00.000Z'
        },
        nb_months_due: 12,
        premium: 69.84,
        start_date: '2020-01-05',
        term_start_date: '2020-01-05',
        term_end_date: '2020-01-05',
        subscribed_at: '2020-01-05T00:00:00.000Z',
        signed_at: '2020-01-05T00:00:00.000Z',
        paid_at: '2020-01-05T00:00:00.000Z',
        special_operations_code: null,
        special_operations_code_applied_at: null,
        status: 'INITIATED'
      }

      beforeEach(async () => {
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .resolves(policy)

        response = await httpServer.api()
          .post(`/v1/policies/${policyId}/apply-spec-ops-code`)
          .send({
            spec_ops_code: 'SEMESTER1'
          })
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return a policy', async () => {
        expect(response.body).to.deep.equal(expectedResourcePolicy)
      })
    })

    describe('should convert empty code to BLANK', () => {
      const policyId = 'APP854732081'
      const policy: Policy = createPolicyFixture({ id: policyId })

      const command: ApplySpecialOperationCodeCommand = {
        policyId: 'APP854732081',
        operationCode: 'BLANK'
      }

      it('should reply with status 200', async () => {
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .resolves(policy)

        response = await httpServer.api()
          .post(`/v1/policies/${policyId}/apply-spec-ops-code`)
          .send({
            spec_ops_code: ''
          })

        expect(response).to.have.property('statusCode', 200)
      })
    })

    describe('should convert null code to BLANK', () => {
      const policyId = 'APP854732081'
      const policy: Policy = createPolicyFixture({ id: policyId })

      const command: ApplySpecialOperationCodeCommand = {
        policyId: 'APP854732081',
        operationCode: 'BLANK'
      }

      it('should reply with status 200', async () => {
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .resolves(policy)

        response = await httpServer.api()
          .post(`/v1/policies/${policyId}/apply-spec-ops-code`)
          .send({
            spec_ops_code: null
          })

        expect(response).to.have.property('statusCode', 200)
      })
    })

    describe('should convert blank code to BLANK', () => {
      const policyId = 'APP854732081'
      const policy: Policy = createPolicyFixture({ id: policyId })

      const command: ApplySpecialOperationCodeCommand = {
        policyId: 'APP854732081',
        operationCode: 'BLANK'
      }

      it('should reply with status 200', async () => {
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .resolves(policy)

        response = await httpServer.api()
          .post(`/v1/policies/${policyId}/apply-spec-ops-code`)
          .send({
            spec_ops_code: '     '
          })

        expect(response).to.have.property('statusCode', 200)
      })
    })

    describe('when the policy is not found', () => {
      it('should reply with status 404', async () => {
        const command: ApplySpecialOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .rejects(new PolicyNotFoundError(command.policyId))

        response = await httpServer.api()
          .post(`/v1/policies/${command.policyId}/apply-spec-ops-code`)
          .send({
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${command.policyId}`)
      })
    })

    describe('when the policy has been canceled', () => {
      it('should reply with status 409', async () => {
        const command: ApplySpecialOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .rejects(new PolicyCanceledError(command.policyId))

        response = await httpServer.api()
          .post(`/v1/policies/${command.policyId}/apply-spec-ops-code`)
          .send({
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', `The policy ${command.policyId} has been canceled`)
      })
    })

    describe('when the policy is not updatable', () => {
      it('should reply with status 409', async () => {
        const command: ApplySpecialOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .rejects(new PolicyNotUpdatableError(command.policyId, Policy.Status.Signed))

        response = await httpServer.api()
          .post(`/v1/policies/${command.policyId}/apply-spec-ops-code`)
          .send({
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', `Could not update policy ${command.policyId} because it is already SIGNED`)
      })
    })

    describe('when the partner is not found', () => {
      it('should reply with status 404', async () => {
        const command: ApplySpecialOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .rejects(new PartnerNotFoundError('Partner'))

        response = await httpServer.api()
          .post('/v1/policies/APP854732081/apply-spec-ops-code')
          .send({
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Could not find partner with code : Partner')
      })
    })

    describe('when the special operation code is not applicable', () => {
      it('should reply with status 422', async () => {
        const command: ApplySpecialOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .rejects(new OperationCodeNotApplicableError('SEMESTER1', 'Partner'))

        response = await httpServer.api()
          .post('/v1/policies/APP854732081/apply-spec-ops-code')
          .send({
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'The operation code SEMESTER1 is not applicable for partner : Partner')
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        const command: ApplySpecialOperationCodeCommand = {
          policyId: 'APP854732081',
          operationCode: 'SEMESTER1'
        }
        sinon.stub(container, 'ApplySpecialOperationCodeOnPolicy')
          .withArgs(command)
          .rejects(new Error())

        response = await httpServer.api()
          .post('/v1/policies/APP854732081/apply-spec-ops-code')
          .send({
            spec_ops_code: 'SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when wrong spec ops code format', async () => {
        response = await httpServer.api()
          .post('/v1/policies/APP854732081/apply-spec-ops-code')
          .send({
            spec_ops_code: 'SEMESTER1SEMESTER1SEMESTER1SEMESTER1SEMESTER1SEMESTER1S' +
                  'SEMESTER1SEMESTER1SEMESTER1SEMESTER1SEMESTER1EMESTER1SEMESTER1SEMESTER1'
          })

        expect(response).to.have.property('statusCode', 400)
      })
    })

    describe('when there is a missing key', () => {
      it('should return status 400', async () => {
        response = await httpServer.api()
          .post('/v1/policies/APP854732081/apply-spec-ops-code')
          .send({
            wrong_key: 'key'
          })

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })

  describe('POST /v1/policies/id/change-start-date', async () => {
    let response: supertest.Response
    const startDate = new Date('2020-04-26')

    describe('when success', () => {
      const policyId = 'APP854732081'
      const policy: Policy = createPolicyFixture({ id: policyId })

      const command: ApplyStartDateOnPolicyCommand = {
        policyId: 'APP854732081',
        startDate: startDate
      }

      const expectedResourcePolicy = {
        id: 'APP854732081',
        code: 'myPartner',
        insurance: {
          monthly_price: 5.82,
          default_deductible: 150,
          default_cap: 7000,
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
          person: {
            firstname: 'Jean',
            lastname: 'Dupont'
          },
          other_people: [{ firstname: 'John', lastname: 'Doe' }]
        },
        policy_holder: {
          lastname: 'Dupont',
          firstname: 'Jean',
          address: '13 rue du loup garou',
          postal_code: '91100',
          city: 'Corbeil-Essonnes',
          email: 'jeandupont@email.com',
          phone_number: '+33684205510',
          email_validated_at: '2020-01-05T00:00:00.000Z'
        },
        nb_months_due: 12,
        premium: 69.84,
        start_date: '2020-01-05',
        term_start_date: '2020-01-05',
        term_end_date: '2020-01-05',
        subscribed_at: '2020-01-05T00:00:00.000Z',
        signed_at: '2020-01-05T00:00:00.000Z',
        paid_at: '2020-01-05T00:00:00.000Z',
        special_operations_code: null,
        special_operations_code_applied_at: null,
        status: 'INITIATED'
      }

      beforeEach(async () => {
        sinon.stub(container, 'ApplyStartDateOnPolicy')
          .withArgs(command)
          .resolves(policy)

        response = await httpServer.api()
          .post(`/v1/policies/${policyId}/change-start-date`)
          .send({
            start_date: '2020-04-26'
          })
      })

      it('should reply with status 201', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return a policy', async () => {
        expect(response.body).to.deep.equal(expectedResourcePolicy)
      })
    })

    describe('when the policy is not found', () => {
      it('should reply with status 404', async () => {
        const command: ApplyStartDateOnPolicyCommand = {
          policyId: 'APP854732081',
          startDate: startDate
        }
        sinon.stub(container, 'ApplyStartDateOnPolicy')
          .withArgs(command)
          .rejects(new PolicyNotFoundError(command.policyId))

        response = await httpServer.api()
          .post(`/v1/policies/${command.policyId}/change-start-date`)
          .send({
            start_date: '2020-04-26'
          })

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${command.policyId}`)
      })
    })

    describe('when the policy is not found', () => {
      it('should reply with status 409', async () => {
        const command: ApplyStartDateOnPolicyCommand = {
          policyId: 'APP854732081',
          startDate: startDate
        }
        sinon.stub(container, 'ApplyStartDateOnPolicy')
          .withArgs(command)
          .rejects(new PolicyCanceledError(command.policyId))

        response = await httpServer.api()
          .post(`/v1/policies/${command.policyId}/change-start-date`)
          .send({
            start_date: '2020-04-26'
          })

        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', `The policy ${command.policyId} has been canceled`)
      })
    })

    describe('when the policy is not updatable', () => {
      it('should reply with status 409', async () => {
        const command: ApplyStartDateOnPolicyCommand = {
          policyId: 'APP854732081',
          startDate: startDate
        }
        sinon.stub(container, 'ApplyStartDateOnPolicy')
          .withArgs(command)
          .rejects(new PolicyNotUpdatableError(command.policyId, Policy.Status.Signed))

        response = await httpServer.api()
          .post(`/v1/policies/${command.policyId}/change-start-date`)
          .send({
            start_date: '2020-04-26'
          })

        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', `Could not update policy ${command.policyId} because it is already SIGNED`)
      })
    })

    describe('when catching PolicyStartDateConsistencyError', () => {
      it('should reply with status 422', async () => {
        const command: ApplyStartDateOnPolicyCommand = {
          policyId: 'APP854732081',
          startDate: startDate
        }
        sinon.stub(container, 'ApplyStartDateOnPolicy')
          .withArgs(command)
          .rejects(new PolicyStartDateConsistencyError())

        response = await httpServer.api()
          .post('/v1/policies/APP854732081/change-start-date')
          .send({
            start_date: '2020-04-26'
          })

        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'Start date cannot be earlier than today')
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        const command: ApplyStartDateOnPolicyCommand = {
          policyId: 'APP854732081',
          startDate: startDate
        }
        sinon.stub(container, 'ApplyStartDateOnPolicy')
          .withArgs(command)
          .rejects(new Error())

        response = await httpServer.api()
          .post('/v1/policies/APP854732081/change-start-date')
          .send({
            start_date: '2020-04-26'
          })

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when wrong spec ops code format', async () => {
        response = await httpServer.api()
          .post('/v1/policies/APP854732081/change-start-date')
          .send({
            start_date: 'wrong_date_format'
          })

        expect(response).to.have.property('statusCode', 400)
      })
    })

    describe('when there is a missing key', () => {
      it('should return status 400', async () => {
        response = await httpServer.api()
          .post('/v1/policies/APP854732081/change-start-date')
          .send({
            wrong_key: 'key'
          })

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })
})
