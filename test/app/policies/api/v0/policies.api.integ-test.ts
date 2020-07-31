import { HttpServerForTesting, newMinimalServer } from '../../../../utils/server.test-utils'
import { container, policiesRoutes } from '../../../../../src/app/policies/policies.container'
import * as supertest from 'supertest'
import { expect, sinon } from '../../../../test-utils'
import {
  PolicyAlreadySignedError,
  PolicyNotFoundError,
  PolicyNotUpdatable
} from '../../../../../src/app/policies/domain/policies.errors'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { createOngoingPolicyFixture, createPolicyFixture } from '../../fixtures/policy.fixture'
import { createPolicyApiRequestFixture } from '../../fixtures/createPolicyApiRequest.fixture'
import { QuoteNotFoundError } from '../../../../../src/app/quotes/domain/quote.errors'
import { GetPolicyQuery } from '../../../../../src/app/policies/domain/get-policy-query'
import { Certificate } from '../../../../../src/app/policies/domain/certificate/certificate'
import { CannotGeneratePolicyNotApplicableError } from '../../../../../src/app/policies/domain/certificate/certificate.errors'
import { SignatureRequest } from '../../../../../src/app/policies/domain/signature-request'
import { ContractGenerationFailureError, SignatureRequestCreationFailureError, SpecificTermsGenerationFailureError } from '../../../../../src/app/policies/domain/signature-request.errors'
import { SpecificTerms } from '../../../../../src/app/policies/domain/specific-terms/specific-terms'
import { SpecificTermsNotFoundError } from '../../../../../src/app/policies/domain/specific-terms/specific-terms.errors'
import {
  UpdatePolicyStartDateAndDurationCommand
} from '../../../../../src/app/policies/domain/update-policy-start-date-and-duration.usecase'
import { OperationCodeNotApplicableError } from '../../../../../src/app/pricing/domain/operation-code.errors'

describe('Policies - API - Integration', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(policiesRoutes())
  })

  describe('POST /v0/policies/:id/payment-intents', async () => {
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
          .post('/v0/policies/p0l1cy1d/payment-intents')
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
          .post('/v0/policies/p0l1cy1d/payment-intents')

        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${policyId}`)
      })
    })

    describe('when there is an unknown error', () => {
      it('should reply with status 500 when unknown error', async () => {
        sinon.stub(container, 'CreatePaymentIntentForPolicy')
          .withArgs({ policyId: 'p0l1cy1d' })
          .rejects(new Error())

        response = await httpServer.api()
          .post('/v0/policies/p0l1cy1d/payment-intents')

        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when wrong policy id format', async () => {
        response = await httpServer.api()
          .post('/v0/policies/01234567890123456789' +
              '012345678901234567890123456789' +
              '012345678901234567890123456789' +
              '01234567890123456789_T00_L0NG_1D/payment-intents')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })

  describe('POST /v0/policies', async () => {
    let response: supertest.Response
    const requestParams: any = createPolicyApiRequestFixture()

    describe('when the policy is created', async () => {
      const policy: Policy = createOngoingPolicyFixture()

      beforeEach(async () => {
        // Given
        sinon.stub(container, 'CreatePolicy').resolves(policy)

        // When
        response = await httpServer.api()
          .post('/v0/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 201)
      })

      it('should return the created quote', async () => {
        const expectedResourcePolicy = {
          id: 'APP753210859',
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
          subscription_date: null,
          signature_date: null,
          payment_date: null,
          status: 'INITIATED'
        }

        expect(response.body).to.deep.equal(expectedResourcePolicy)
      })
    })

    describe('when the quote is not found', async () => {
      it('should return a 404', async () => {
        // Given
        sinon.stub(container, 'CreatePolicy').rejects(new QuoteNotFoundError(requestParams.quote_id))

        // When
        response = await httpServer.api()
          .post('/v0/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Quote with id 3E76DJ2 cannot be found')
      })
    })

    describe('when there is an internal error', async () => {
      it('should return a 500', async () => {
        // Given
        sinon.stub(container, 'CreatePolicy').rejects(new Error())

        // When
        response = await httpServer.api()
          .post('/v0/policies')
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

      it('should reply with status 400 when there is no code', async () => {
        // Given
        delete requestParams.code

        // When
        response = await httpServer.api()
          .post('/v0/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when there is no quote_id', async () => {
        // Given
        delete requestParams.quote_id

        // When
        response = await httpServer.api()
          .post('/v0/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when start_date is not a date', async () => {
        // Given
        requestParams.start_date = 'not a date'

        // When
        response = await httpServer.api()
          .post('/v0/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when there is no contact', async () => {
        // Given
        delete requestParams.contact

        // When
        response = await httpServer.api()
          .post('/v0/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      describe('should reply with status 400 when there is a contact but', async () => {
        it('no email', async () => {
          // Given
          delete requestParams.contact.email

          // When
          response = await httpServer.api()
            .post('/v0/policies')
            .send(requestParams)
            .set('X-Consumer-Username', 'myPartner')

          expect(response).to.have.property('statusCode', 400)
        })

        it('no phone_number', async () => {
          // Given
          delete requestParams.contact.phone_number

          // When
          response = await httpServer.api()
            .post('/v0/policies')
            .send(requestParams)
            .set('X-Consumer-Username', 'myPartner')

          expect(response).to.have.property('statusCode', 400)
        })
      })

      it('should reply with status 400 when there is no risk', async () => {
        // Given
        delete requestParams.risk

        // When
        response = await httpServer.api()
          .post('/v0/policies')
          .send(requestParams)
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      describe('should reply with status 400 when there is a risk', async () => {
        it('but no people', async () => {
          // Given
          delete requestParams.risk.people

          // When
          response = await httpServer.api()
            .post('/v0/policies')
            .send(requestParams)
            .set('X-Consumer-Username', 'myPartner')

          expect(response).to.have.property('statusCode', 400)
        })

        it('but no property', async () => {
          // Given
          delete requestParams.risk.property

          // When
          response = await httpServer.api()
            .post('/v0/policies')
            .send(requestParams)
            .set('X-Consumer-Username', 'myPartner')

          expect(response).to.have.property('statusCode', 400)
        })

        describe('and a property but', async () => {
          it('but no address', async () => {
            // Given
            delete requestParams.risk.property.address

            // When
            response = await httpServer.api()
              .post('/v0/policies')
              .send(requestParams)
              .set('X-Consumer-Username', 'myPartner')

            expect(response).to.have.property('statusCode', 400)
          })

          it('but no postal_code', async () => {
            // Given
            delete requestParams.risk.property.postal_code

            // When
            response = await httpServer.api()
              .post('/v0/policies')
              .send(requestParams)
              .set('X-Consumer-Username', 'myPartner')

            expect(response).to.have.property('statusCode', 400)
          })

          it('but no city', async () => {
            // Given
            delete requestParams.risk.property.city

            // When
            response = await httpServer.api()
              .post('/v0/policies')
              .send(requestParams)
              .set('X-Consumer-Username', 'myPartner')

            expect(response).to.have.property('statusCode', 400)
          })
        })

        it('but no policy holder', async () => {
          // Given
          delete requestParams.risk.people.policy_holder

          // When
          response = await httpServer.api()
            .post('/v0/policies')
            .send(requestParams)
            .set('X-Consumer-Username', 'myPartner')

          expect(response).to.have.property('statusCode', 400)
        })

        describe('and a policy holder but', async () => {
          it('but no firstname', async () => {
            // Given
            delete requestParams.risk.people.policy_holder.firstname

            // When
            response = await httpServer.api()
              .post('/v0/policies')
              .send(requestParams)
              .set('X-Consumer-Username', 'myPartner')

            expect(response).to.have.property('statusCode', 400)
          })

          it('but no lastname', async () => {
            // Given
            delete requestParams.risk.people.policy_holder.lastname

            // When
            response = await httpServer.api()
              .post('/v0/policies')
              .send(requestParams)
              .set('X-Consumer-Username', 'myPartner')

            expect(response).to.have.property('statusCode', 400)
          })
        })

        describe('and an other insured but', async () => {
          it('but no firstname', async () => {
            // Given
            delete requestParams.risk.people.other_insured[0].firstname

            // When
            response = await httpServer.api()
              .post('/v0/policies')
              .send(requestParams)
              .set('X-Consumer-Username', 'myPartner')

            expect(response).to.have.property('statusCode', 400)
          })

          it('but no lastname', async () => {
            // Given
            delete requestParams.risk.people.other_insured[0].lastname

            // When
            response = await httpServer.api()
              .post('/v0/policies')
              .send(requestParams)
              .set('X-Consumer-Username', 'myPartner')

            expect(response).to.have.property('statusCode', 400)
          })
        })

        it('no phone_number', async () => {
          // Given
          delete requestParams.contact.phone_number

          // When
          response = await httpServer.api()
            .post('/v0/policies')
            .send(requestParams)
            .set('X-Consumer-Username', 'myPartner')

          expect(response).to.have.property('statusCode', 400)
        })
      })
    })
  })

  describe('GET /v0/policies/:id', async () => {
    let response: supertest.Response

    describe('when the policy is found', async () => {
      before(async () => {
        // Given
        const policyId: string = 'APP105944294'
        const expectedPolicy: Policy = createPolicyFixture({ id: policyId })
        const getPolicyQuery: GetPolicyQuery = { policyId }
        sinon.stub(container, 'GetPolicy').withArgs(getPolicyQuery).resolves(expectedPolicy)

        // When
        response = await httpServer.api().get(`/v0/policies/${policyId}`).set('X-Consumer-Username', 'myPartner')
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

    describe('when there is an internal error', async () => {
      it('should reply with status 500', async () => {
        // Given
        const policyId: string = 'APP105944294'
        const getPolicyQuery: GetPolicyQuery = { policyId }
        sinon.stub(container, 'GetPolicy').withArgs(getPolicyQuery).rejects(new Error())

        // When
        const response = await httpServer.api().get(`/v0/policies/${policyId}`).set('X-Consumer-Username', 'myPartner')

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
        const response = await httpServer.api().get(`/v0/policies/${policyId}`).set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${policyId}`)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id is not 12 characters', async () => {
        // When
        const response = await httpServer.api().get('/v0/policies/WRONG').set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })

  describe('POST /v0/policies/id/certificates', async () => {
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
          .post('/v0/policies/APP753210859/certificates')
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
      it('should return a 422', async () => {
        // Given
        sinon.stub(container, 'GeneragePolicyCertificate').rejects(new PolicyNotFoundError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v0/policies/APP753210859/certificates')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'Could not find policy with id : APP753210859')
      })
    })

    describe('when the policy is not applicable yet', async () => {
      it('should return a 422', async () => {
        // Given
        sinon.stub(container, 'GeneragePolicyCertificate').rejects(new CannotGeneratePolicyNotApplicableError())

        // When
        response = await httpServer.api()
          .post('/v0/policies/APP753210859/certificates')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'Could not generate the certificate because the policy is not applicable yet')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id has not 12 chars', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/policies/APP3465/certificates')
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
          .post('/v0/policies/APP753210859/certificates')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })
  })

  describe('GET /v0/policies/id/specific-terms', async () => {
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
          .get('/v0/policies/APP753210859/specific-terms')
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
      it('should return a 422', async () => {
        // Given
        sinon.stub(container, 'GetPolicySpecificTerms').rejects(new SpecificTermsNotFoundError('name'))

        // When
        response = await httpServer.api()
          .get('/v0/policies/APP753210859/specific-terms')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Specific terms name not found')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id has not 12 chars', async () => {
        // When
        response = await httpServer.api()
          .get('/v0/policies/APP7532159/specific-terms')
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
          .get('/v0/policies/APP753210859/specific-terms')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })
  })

  describe('GET /v0/policies/id/specific-terms', async () => {
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
          .get('/v0/policies/APP753210859/specific-terms')
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
      it('should return a 422', async () => {
        // Given
        sinon.stub(container, 'GetPolicySpecificTerms').rejects(new SpecificTermsNotFoundError('name'))

        // When
        response = await httpServer.api()
          .get('/v0/policies/APP753210859/specific-terms')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Specific terms name not found')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id has not 12 chars', async () => {
        // When
        response = await httpServer.api()
          .get('/v0/policies/APP7532159/specific-terms')
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
          .get('/v0/policies/APP753210859/specific-terms')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })
  })

  describe('POST /v0/policies/id/signature-request', async () => {
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
          .post('/v0/policies/APP753210859/signature-request')
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
          .post('/v0/policies/APP753210859/signature-request')
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
          .post('/v0/policies/APP753210859/signature-request')
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
          .post('/v0/policies/APP753210859/signature-request')
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
          .post('/v0/policies/APP753210859/signature-request')
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
          .post('/v0/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Specific terms specificTermsName not found')
      })
    })

    describe('when the policy has already been signed', async () => {
      it('should return a 409', async () => {
        // Given
        sinon.stub(container, 'CreateSignatureRequestForPolicy').rejects(new PolicyAlreadySignedError('APP753210859'))

        // When
        response = await httpServer.api()
          .post('/v0/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', 'Policy APP753210859 has already been signed')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id has not 12 chars', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/policies/APP02/signature-request')
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
          .post('/v0/policies/APP753210859/signature-request')
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })
  })

  describe('PATCH /v0/policies/:id', async () => {
    let response: supertest.Response

    describe('when the policy is updated', async () => {
      before(async () => {
        // Given
        const policyId: string = 'APP105944294'
        const expectedPolicy: Policy = createPolicyFixture({ id: policyId })
        const command: UpdatePolicyStartDateAndDurationCommand = { policyId, operationCode: 'MYCODE', startDate: new Date('2020-04-05') }
        sinon.stub(container, 'UpdatePolicyStartDateAndDuration').withArgs(command).resolves(expectedPolicy)

        // When
        response = await httpServer.api().patch(`/v0/policies/${policyId}`)
          .send({ spec_ops_code: 'MYCODE', start_date: '2020-04-05' })
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 200', async () => {
        // Then
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return the policy updated', async () => {
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

    describe('when there is an internal error', async () => {
      it('should reply with status 500', async () => {
        // Given
        const policyId: string = 'APP105944294'
        sinon.stub(container, 'UpdatePolicyStartDateAndDuration').rejects(Error)

        // When
        response = await httpServer.api().patch(`/v0/policies/${policyId}`)
          .send({ spec_ops_code: 'MYCODE', start_date: '2020-04-05' })
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when the policy is not found', () => {
      it('should reply with status 404', async () => {
        // Given
        const policyId: string = 'APP105944294'
        sinon.stub(container, 'UpdatePolicyStartDateAndDuration').rejects(new PolicyNotFoundError(policyId))

        // When
        response = await httpServer.api().patch(`/v0/policies/${policyId}`)
          .send({ spec_ops_code: 'MYCODE', start_date: '2020-04-05' })
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find policy with id : ${policyId}`)
      })
    })

    describe('when the policy cannot be updated because it is already signed or payed or applicable', () => {
      it('should reply with status 422', async () => {
        // Given
        const policyId: string = 'APP105944294'
        sinon.stub(container, 'UpdatePolicyStartDateAndDuration').rejects(new PolicyNotUpdatable(policyId, Policy.Status.Signed))

        // When
        response = await httpServer.api().patch(`/v0/policies/${policyId}`)
          .send({ spec_ops_code: 'MYCODE', start_date: '2020-04-05' })
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'Could not update policy APP105944294 because it is already SIGNED')
      })
    })
    describe('when the operation code is not applicable for the partner', () => {
      it('should reply with status 422', async () => {
        // Given
        const policyId: string = 'APP105944294'
        sinon.stub(container, 'UpdatePolicyStartDateAndDuration').rejects(new OperationCodeNotApplicableError('SEMESTER', 'mypartner'))

        // When
        response = await httpServer.api().patch(`/v0/policies/${policyId}`)
          .send({ spec_ops_code: 'MYCODE', start_date: '2020-04-05' })
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'The operation code SEMESTER is not applicable for partner : mypartner')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when the policy id is not 12 characters', async () => {
        // When
        const response = await httpServer.api().patch('/v0/policies/WRONGPOLICY')
          .send({ spec_ops_code: 'MYCODE', start_date: '2020-04-05' })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when there is no spec ops code', async () => {
        // When
        const response = await httpServer.api().patch('/v0/policies/APP658143293')
          .send({ start_date: '2020-04-05' })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when the policy id is not 12 characters', async () => {
        // When
        const response = await httpServer.api().patch('/v0/policies/APP658143293')
          .send({ spec_ops_code: 'MYCODE' })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })
})
