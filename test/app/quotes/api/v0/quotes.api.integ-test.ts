import * as supertest from 'supertest'
import { expect, HttpServerForTesting, newMinimalServer, sinon } from '../../../../test-utils'
import { Quote } from '../../../../../src/app/quotes/domain/quote'
import { container, quoteRoutes } from '../../../../../src/app/quotes/quote.container'
import { PartnerNotFoundError } from '../../../../../src/app/partners/domain/partner.errors'
import {
  NoPartnerInsuranceForRiskError,
  QuoteNotFoundError, QuotePartnerOwnershipError,
  QuotePolicyHolderEmailNotFoundError,
  QuoteRiskNumberOfRoommatesError,
  QuoteRiskPropertyRoomCountNotInsurableError,
  QuoteRiskRoommatesNotAllowedError,
  QuoteStartDateConsistencyError
} from '../../../../../src/app/quotes/domain/quote.errors'
import {
  createQuoteFixture,
  createQuoteInsuranceFixture,
  createQuoteRiskFixture,
  createUpdateQuoteCommandFixture,
  createUpdateQuoteCommandRiskFixture,
  createUpdateQuotePayloadFixture
} from '../../fixtures/quote.fixture'
import { UpdateQuoteCommand } from '../../../../../src/app/quotes/domain/update-quote-command'
import { OperationCodeNotApplicableError } from '../../../../../src/app/policies/domain/operation-code.errors'
import {
  DefaultCapAdviceNotFoundError
} from '../../../../../src/app/quotes/domain/default-cap-advice/default-cap-advice.errors'
import {
  populatePricingMatrixSqlFixture,
  resetPricingMatrixSqlFixture
} from '../../../partners/fixtures/pricing-matrix-sql.fixture'

describe('Quotes - API - Integration', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newMinimalServer(quoteRoutes())
    await populatePricingMatrixSqlFixture()
  })

  after(async () => {
    await resetPricingMatrixSqlFixture()
  })

  describe('POST /v0/quotes', () => {
    let response: supertest.Response

    describe('when the quote is created', () => {
      const quote: Quote = {
        id: 'UD65X3A',
        partnerCode: 'myPartner',
        risk: {
          property: {
            roomCount: 2,
            address: '52 Rue Beaubourg',
            postalCode: '75003',
            city: 'Paris'
          }
        },
        insurance: {
          estimate: {
            monthlyPrice: 5.82,
            defaultDeductible: 150,
            defaultCeiling: 7000
          },
          currency: 'EUR',
          simplifiedCovers: ['ACDDE', 'ACVOL'],
          productCode: 'APP658',
          productVersion: '2020-07-15',
          contractualTerms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid'
        },
        policyHolder: {},
        nbMonthsDue: 12,
        premium: 69.84,
        specialOperationsCode: null,
        specialOperationsCodeAppliedAt: null
      }

      const expectedResourceQuote = {
        id: 'UD65X3A',
        risk: {
          property: {
            room_count: 2,
            address: '52 Rue Beaubourg',
            postal_code: '75003',
            city: 'Paris'
          }
        },
        insurance: {
          monthly_price: 5.82,
          default_deductible: 150,
          default_ceiling: 7000,
          currency: 'EUR',
          simplified_covers: ['ACDDE', 'ACVOL'],
          product_code: 'APP658',
          product_version: '2020-07-15',
          contractual_terms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid'
        },
        code: 'myPartner',
        special_operations_code: null,
        special_operations_code_applied_at: null
      }

      beforeEach(async () => {
        // Given
        sinon.stub(container, 'CreateQuote').withArgs({ partnerCode: 'myPartner', specOpsCode: 'BLANK', risk: quote.risk }).resolves(quote)

        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({
            code: 'myPartner',
            risk: {
              property: {
                room_count: 2,
                address: '52 Rue Beaubourg',
                postal_code: '75003',
                city: 'Paris'
              }
            }
          })
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 201', async () => {
        expect(response).to.have.property('statusCode', 201)
      })

      it('should return the created quote', async () => {
        expect(response.body).to.deep.equal(expectedResourceQuote)
      })
    })

    describe('when the partner is not found', () => {
      it('should reply with status 404', async () => {
        // Given
        const partnerCode: string = 'unknownPartner'
        const risk = {
          property: {
            roomCount: 2,
            address: '52 Rue Beaubourg',
            postalCode: '75003',
            city: 'Paris'
          }
        }
        const specOpsCode = 'BLANK'
        sinon.stub(container, 'CreateQuote').withArgs({ partnerCode, risk, specOpsCode }).rejects(new PartnerNotFoundError(partnerCode))

        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({
            code: partnerCode,
            risk: {
              property: {
                room_count: 2,
                address: '52 Rue Beaubourg',
                postal_code: '75003',
                city: 'Paris'
              }
            }
          })
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find partner with code : ${partnerCode}`)
      })
    })

    describe('when there is no insurance for the given risk', () => {
      it('should reply with status 422', async () => {
        // Given
        const partnerCode: string = 'myPartner'
        const risk = { property: { roomCount: 2, postalCode: undefined, city: undefined, address: undefined } }
        const specOpsCode = 'BLANK'
        sinon.stub(container, 'CreateQuote').withArgs({ partnerCode, risk, specOpsCode }).rejects(new NoPartnerInsuranceForRiskError(partnerCode, risk))

        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: partnerCode, risk: { property: { room_count: 2 } } })
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'Partner with code myPartner does not have an insurance for risk {"property":{"roomCount":2}}')
      })
    })

    describe('when there is no default cap advice found', () => {
      it('should reply with status 500 because it should not happen', async () => {
        // Given
        const partnerCode: string = 'myPartner'
        const risk = { property: { roomCount: 2, postalCode: undefined, city: undefined, address: undefined } }
        const specOpsCode = 'BLANK'
        sinon.stub(container, 'CreateQuote').withArgs({ partnerCode, risk, specOpsCode }).rejects(new DefaultCapAdviceNotFoundError(partnerCode, risk.property.roomCount))

        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: partnerCode, risk: { property: { room_count: 2 } } })
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when there is no code', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ risk: { property: { room_count: 2 } } })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when there is no risk', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: 'myPartner' })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when there is a risk but no property risk', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: 'myPartner', risk: {} })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('should reply with status 400 when there is a property risk but no room count', async () => {
        // When
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({ code: 'myPartner', risk: { property: {} } })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('Should reply with status 400 when the code postal is invalid', async () => {
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({
            code: 'myPartner',
            risk: {
              property: {
                room_count: 2,
                address: '52 Rue Beaubourg',
                postal_code: 'F4k30',
                city: 'Paris'
              }
            }
          })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })

      it('Should reply with status 422 when special operations code is not applicable for selected partner', async () => {
        const invalidSpecOpsCode = '!Nv4l!D'
        const partnerCode = 'demo-student'
        response = await httpServer.api()
          .post('/v0/quotes')
          .send({
            code: partnerCode,
            spec_ops_code: invalidSpecOpsCode,
            risk: {
              property: {
                room_count: 2,
                address: '52 Rue Beaubourg',
                postal_code: '75019',
                city: 'Paris'
              }
            }
          })
          .set('X-Consumer-Username', partnerCode)

        expect(response).to.have.property('statusCode', 422)
        expect(response.body.message).to.equal(`The operation code ${invalidSpecOpsCode} is not applicable for partner : ${partnerCode}`)
      })
    })
  })

  describe('POST /v0/quotes/{id}/policy-holder/send-email-validation-email', () => {
    let response: supertest.Response
    const quoteId: string = 'QU0T31D'

    describe('when success', () => {
      it('should call usecase then reply with status 204', async () => {
        // Given
        sinon.stub(container, 'SendValidationLinkEmailToQuotePolicyHolder').withArgs(quoteId).resolves()
        // When
        response = await httpServer.api()
          .post(`/v0/quotes/${quoteId}/policy-holder/send-email-validation-email`)
          .set('X-Consumer-Username', 'myPartner')
        // Then
        expect(response).to.have.property('statusCode', 204)
      })
    })

    describe('when QuoteNotFoundError is thrown by usecase', () => {
      it('should reply with status 404', async () => {
        // Given
        const quoteId: string = 'QU0T31D'
        sinon.stub(container, 'SendValidationLinkEmailToQuotePolicyHolder')
          .withArgs(quoteId).rejects(new QuoteNotFoundError(quoteId))

        // When
        response = await httpServer.api()
          .post(`/v0/quotes/${quoteId}/policy-holder/send-email-validation-email`)
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find quote with id : ${quoteId}`)
      })
    })

    describe('when PartnerNotFoundError is thrown by usecase', () => {
      it('should reply with status 500', async () => {
        // Given
        const quoteId: string = 'QU0T31D'
        const partnerCode: string = 'myPartner'
        sinon.stub(container, 'SendValidationLinkEmailToQuotePolicyHolder')
          .withArgs(quoteId).rejects(new PartnerNotFoundError(partnerCode))

        // When
        response = await httpServer.api()
          .post(`/v0/quotes/${quoteId}/policy-holder/send-email-validation-email`)
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 500)
        expect(response.body).to.have.property('message', 'An internal server error occurred')
      })
    })

    describe('when QuotePolicyHolderEmailNotFoundError is thrown by usecase', () => {
      it('should reply with status 409', async () => {
        // Given
        const quoteId: string = 'QU0T31D'
        sinon.stub(container, 'SendValidationLinkEmailToQuotePolicyHolder')
          .withArgs(quoteId).rejects(new QuotePolicyHolderEmailNotFoundError(quoteId))

        // When
        response = await httpServer.api()
          .post(`/v0/quotes/${quoteId}/policy-holder/send-email-validation-email`)
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 409)
        expect(response.body).to.have.property('message', `Could not find email address for policy holder attached to quote with id : ${quoteId}`)
      })
    })

    describe('when a validation error occurred', () => {
      it('should reply with status 400', async () => {
        // Given
        const wrongQuoteId: string = 'QuoteIdT00L0NGT00L0NGT00L0NGT00L0NGT00L0NG'

        // When
        response = await httpServer.api()
          .post(`/v0/quotes/${wrongQuoteId}/policy-holder/send-email-validation-email`)
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })

  describe('PUT /v0/quotes/{id}', () => {
    let response: supertest.Response

    describe('when the quote is updated', () => {
      const quoteId = 'UD65X3A'

      const quote: Quote = createQuoteFixture(
        {
          id: quoteId,
          risk: createQuoteRiskFixture({
            otherPeople: [{ firstname: 'Kasy', lastname: 'Ade' }]
          }),
          insurance: createQuoteInsuranceFixture({
            estimate: { monthlyPrice: 10, defaultDeductible: 100, defaultCeiling: 1000 },
            productCode: 'APP658',
            productVersion: '2020-07-15'
          }),
          nbMonthsDue: 12,
          premium: 120,
          startDate: new Date('2020-01-05T10:09:08'),
          termStartDate: new Date('2020-01-05T10:09:08'),
          termEndDate: new Date('2021-01-05T10:09:08')
        }
      )

      const expectedQuoteResource = {
        id: quoteId,
        code: 'myPartner',
        risk: {
          property: {
            room_count: 2,
            address: '88 rue des prairies',
            postal_code: '91100',
            city: 'Kyukamura'
          },
          person: {
            firstname: 'Jean-Jean',
            lastname: 'Lapin'
          },
          other_people: [
            {
              firstname: 'Kasy',
              lastname: 'Ade'
            }
          ]
        },
        insurance: {
          monthly_price: 10,
          default_deductible: 100,
          default_cap: 1000,
          currency: 'EUR',
          simplified_covers: ['ACDDE', 'ACVOL'],
          product_code: 'APP658',
          product_version: '2020-07-15',
          contractual_terms: '/path/to/contractual/terms',
          ipid: '/path/to/ipid'
        },
        policy_holder: {
          firstname: 'Jean-Jean',
          lastname: 'Lapin',
          address: '88 rue des prairies',
          postal_code: '91100',
          city: 'Kyukamura',
          email: 'jeanjean@email.com',
          phone_number: '+33684205510',
          email_validated_at: null
        },
        nb_months_due: 12,
        premium: 120,
        start_date: '2020-01-05',
        term_start_date: '2020-01-05',
        term_end_date: '2021-01-05'
      }

      beforeEach(async () => {
        // Given
        const updateQuoteCommand: UpdateQuoteCommand = createUpdateQuoteCommandFixture({
          id: quoteId,
          startDate: new Date('Sun, 05 Jan 2020 00:00:00 GMT'),
          specOpsCode: 'SEMESTER1',
          risk: createUpdateQuoteCommandRiskFixture({
            property: {
              roomCount: 2,
              address: '88 rue des prairies',
              postalCode: '91100',
              city: 'Kyukamura'
            },
            person: {
              firstname: 'Jean-Jean',
              lastname: 'Lapin'
            },
            otherPeople: [
              {
                firstname: 'Kasy',
                lastname: 'Ade'
              }
            ]
          })
        })
        sinon.stub(container, 'UpdateQuote').withArgs(updateQuoteCommand).resolves(quote)

        // When
        response = await httpServer.api()
          .put(`/v0/quotes/${quoteId}`)
          .send({
            start_date: '2020-01-05',
            spec_ops_code: 'SEMESTER1',
            risk: {
              property: {
                room_count: 2,
                address: '88 rue des prairies',
                postal_code: '91100',
                city: 'Kyukamura'
              },
              person: {
                firstname: 'Jean-Jean',
                lastname: 'Lapin'
              },
              other_people: [
                {
                  firstname: 'Kasy',
                  lastname: 'Ade'
                }
              ]
            },
            policy_holder: {
              firstname: 'Jean-Jean',
              lastname: 'Lapin',
              address: '88 rue des prairies',
              postal_code: '91100',
              city: 'Kyukamura',
              email: 'jeanjean@email.com',
              phone_number: '+33684205510'
            }
          })
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return updated quote', async () => {
        expect(response.body).to.deep.equal(expectedQuoteResource)
      })
    })

    describe('when PartnerNotFoundError is thrown by usecase', () => {
      it('should reply with status 404', async () => {
        // Given
        const partnerCode: string = 'unknownPartner'
        sinon.stub(container, 'UpdateQuote').rejects(new PartnerNotFoundError(partnerCode))

        // When
        response = await httpServer.api()
          .put('/v0/quotes/UD65X3')
          .send(createUpdateQuotePayloadFixture())
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find partner with code : ${partnerCode}`)
      })
    })

    describe('when QuoteNotFoundError is thrown by usecase', () => {
      it('should reply with status 404', async () => {
        // Given
        const partnerCode: string = 'unknownPartner'
        sinon.stub(container, 'UpdateQuote').rejects(new QuoteNotFoundError('UD65X3'))

        // When
        response = await httpServer.api()
          .put('/v0/quotes/UD65X3')
          .send(createUpdateQuotePayloadFixture())
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Could not find quote with id : UD65X3')
      })
    })

    describe('when QuoteRiskPropertyRoomCountNotInsurableError is thrown by usecase', () => {
      it('should reply with status 422', async () => {
        // Given
        const partnerCode: string = 'myPartner'
        sinon.stub(container, 'UpdateQuote').rejects(new QuoteRiskPropertyRoomCountNotInsurableError(2))

        // When
        response = await httpServer.api()
          .put('/v0/quotes/UD65X3')
          .send(createUpdateQuotePayloadFixture())
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', '2 room(s) property is not insurable')
      })
    })

    describe('when OperationCodeNotApplicableError is thrown by usecase', () => {
      it('should reply with status 422', async () => {
        // Given
        const partnerCode: string = 'myPartner'
        sinon.stub(container, 'UpdateQuote').rejects(new OperationCodeNotApplicableError('SEMESTER33', partnerCode))

        // When
        response = await httpServer.api()
          .put('/v0/quotes/UD65X3')
          .send(createUpdateQuotePayloadFixture())
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'The operation code SEMESTER33 is not applicable for partner : myPartner')
      })
    })

    describe('when QuoteStartDateConsistencyError is thrown by usecase', () => {
      it('should reply with status 422', async () => {
        // Given
        const partnerCode: string = 'myPartner'
        sinon.stub(container, 'UpdateQuote').rejects(new QuoteStartDateConsistencyError())

        // When
        response = await httpServer.api()
          .put('/v0/quotes/UD65X3')
          .send(createUpdateQuotePayloadFixture())
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', 'Start date cannot be earlier than today')
      })
    })

    describe('when payload validation error occurred', () => {
      it('should reply with status 400 when there is no code', async () => {
        // When
        response = await httpServer.api()
          .put('/v0/quotes/UD65X3')
          .send({ wrong: { payload: '1o1' } })
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })

    describe('when QuoteRiskRoommatesNotAllowedError is thrown by usecase', () => {
      it('should reply with status 422', async () => {
        // Given
        const partnerCode: string = 'myPartner'
        sinon.stub(container, 'UpdateQuote').rejects(new QuoteRiskRoommatesNotAllowedError(10))

        // When
        response = await httpServer.api()
          .put('/v0/quotes/UD65X3')
          .send(createUpdateQuotePayloadFixture())
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', '10 room(s) property does not allow roommates')
      })
    })

    describe('when QuoteRiskNumberOfRoommatesError is thrown by usecase', () => {
      it('should reply with status 422', async () => {
        // Given
        const partnerCode: string = 'myPartner'
        sinon.stub(container, 'UpdateQuote').rejects(new QuoteRiskNumberOfRoommatesError(10, 3))

        // When
        response = await httpServer.api()
          .put('/v0/quotes/UD65X3')
          .send(createUpdateQuotePayloadFixture())
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 422)
        expect(response.body).to.have.property('message', '3 room(s) property allows a maximum of 10 roommate(s)')
      })
    })

    describe('when there is no default cap advice found', () => {
      it('should reply with status 500 because it should not happen', async () => {
        // Given
        const partnerCode: string = 'myPartner'
        sinon.stub(container, 'UpdateQuote').rejects(new DefaultCapAdviceNotFoundError(partnerCode, 2))

        // When
        response = await httpServer.api()
          .put('/v0/quotes/UD65X3')
          .send(createUpdateQuotePayloadFixture())
          .set('X-Consumer-Username', partnerCode)

        // Then
        expect(response).to.have.property('statusCode', 500)
      })
    })
  })

  describe('GET /v0/quotes/{id}', () => {
    describe('when the quote is found', () => {
      let response: supertest.Response
      const quote = createQuoteFixture()
      const expectedResourceQuote = {
        id: 'UD65X3A',
        code: 'myPartner',
        risk: {
          property: {
            room_count: 2,
            address: '88 rue des prairies',
            postal_code: '91100',
            city: 'Kyukamura'
          },
          person: {
            firstname: 'Jean-Jean',
            lastname: 'Lapin'
          },
          other_people: [
            {
              firstname: 'John',
              lastname: 'Doe'
            }
          ]
        },
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
        policy_holder: {
          firstname: 'Jean-Jean',
          lastname: 'Lapin',
          address: '88 rue des prairies',
          postal_code: '91100',
          city: 'Kyukamura',
          email: 'jeanjean@email.com',
          phone_number: '+33684205510',
          email_validated_at: null
        },
        premium: 69.84,
        nb_months_due: 12,
        start_date: '2020-01-05',
        term_end_date: '2020-01-05',
        term_start_date: '2020-01-05'
      }

      beforeEach(async () => {
        // Given
        sinon.stub(container, 'GetQuoteById').withArgs({ quoteId: expectedResourceQuote.id, partnerCode: 'myPartner' }).resolves(quote)

        // When
        response = await httpServer.api()
          .get(`/v0/quotes/${expectedResourceQuote.id}`)
          .set('X-Consumer-Username', 'myPartner')
      })

      it('should reply with status 200', async () => {
        expect(response).to.have.property('statusCode', 200)
      })

      it('should return the found quote', async () => {
        expect(response.body).to.deep.equal(expectedResourceQuote)
      })
    })

    describe('when the quote is not found', () => {
      it('should reply with status 404', async () => {
        // Given
        const quoteId: string = 'UNKNOWN'
        sinon.stub(container, 'GetQuoteById').withArgs({ quoteId, partnerCode: 'myPartner' }).rejects(new QuoteNotFoundError(quoteId))

        // When
        const response = await httpServer.api()
          .get(`/v0/quotes/${quoteId}`)
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', `Could not find quote with id : ${quoteId}`)
      })
    })

    describe('when the header partner code soed not match the quote partner code', () => {
      it('should reply with status 404', async () => {
        // Given
        const quoteId: string = '3UR7D6A2'
        sinon.stub(container, 'GetQuoteById').withArgs({ quoteId, partnerCode: 'myPartner' }).rejects(new QuotePartnerOwnershipError(quoteId, 'myPartner'))

        // When
        const response = await httpServer.api()
          .get(`/v0/quotes/${quoteId}`)
          .set('X-Consumer-Username', 'myPartner')

        // Then
        expect(response).to.have.property('statusCode', 404)
        expect(response.body).to.have.property('message', 'Could not find the quote 3UR7D6A2 for partner myPartner')
      })
    })

    describe('when there is a validation error', () => {
      it('should reply with status 400 when quoteId has a wrong format', async () => {
        // When
        const response = await httpServer.api()
          .get('/v0/quotes/small')
          .set('X-Consumer-Username', 'myPartner')

        expect(response).to.have.property('statusCode', 400)
      })
    })
  })
})
