import * as supertest from 'supertest'
import { dateFaker, expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'
import { QuoteSqlModel } from '../../../../../src/app/quotes/infrastructure/sql-models/quote-sql-model'
import { QuoteRepository } from '../../../../../src/app/quotes/domain/quote.repository'
import { QuoteSqlRepository } from '../../../../../src/app/quotes/infrastructure/quote-sql.repository'
import { Quote } from '../../../../../src/app/quotes/domain/quote'
import { createQuoteFixture, createQuoteRiskFixture } from '../../fixtures/quote.fixture'
import { PropertyType } from '../../../../../src/app/common-api/domain/type/property-type'
import { Occupancy } from '../../../../../src/app/common-api/domain/type/occupancy'

async function resetDb () {
  await QuoteSqlModel.destroy({ truncate: true, cascade: true })
}

describe('Quotes - API - E2E', async () => {
  let httpServer: HttpServerForTesting

  before(async () => {
    httpServer = await newProdLikeServer()
  })

  describe('POST /v0/quotes/', () => {
    let response: supertest.Response
    const now = new Date('2020-04-18T10:09:08Z')

    beforeEach(() => {
      dateFaker.setCurrentDate(now)
    })

    afterEach(async () => {
      await resetDb()
    })

    it('should return the quote', async () => {
      // When
      response = await httpServer.api()
        .post('/v0/quotes')
        .send({ code: 'studyo', risk: { property: { room_count: 2, address: '15 Rue Des Amandiers', postal_code: '91110', city: 'Les Ulysses', type: 'FLAT', occupancy: 'TENANT' } } })
        .set('X-Consumer-Username', 'studyo')

      // Then
      expect(response.body).to.deep.equal({
        id: response.body.id,
        risk: {
          property: {
            room_count: 2,
            address: '15 Rue Des Amandiers',
            postal_code: '91110',
            city: 'Les Ulysses',
            type: 'FLAT',
            occupancy: 'TENANT'
          }
        },
        insurance: {
          monthly_price: 7.50,
          currency: 'EUR',
          default_deductible: 120,
          default_ceiling: 5000.00,
          simplified_covers: ['ACDDE', 'ACINCEX', 'ACVOL', 'ACASSHE', 'ACDEFJU', 'ACRC'],
          product_code: 'APP658',
          product_version: '2020-07-15',
          contractual_terms: '/docs/Appenin_Conditions_Generales_assurance_habitation_APP658.pdf',
          ipid: '/docs/Appenin_Document_Information_assurance_habitation_APP658.pdf'
        },
        code: 'studyo',
        special_operations_code: null,
        special_operations_code_applied_at: null
      })
    })

    it('should return the quote with special operations code', async () => {
      // When
      response = await httpServer.api()
        .post('/v0/quotes')
        .send({ code: 'essca', risk: { property: { room_count: 2, type: PropertyType.FLAT, occupancy: 'TENANT' } }, spec_ops_code: 'SEMESTER1' })
        .set('X-Consumer-Username', 'essca')

      // Then
      expect(response.body).to.deep.equal({
        id: response.body.id,
        risk: {
          property: {
            room_count: 2,
            type: PropertyType.FLAT,
            occupancy: Occupancy.TENANT
          }
        },
        insurance: {
          monthly_price: 6.35,
          currency: 'EUR',
          default_deductible: 120,
          default_ceiling: 3000.00,
          simplified_covers: ['ACDDE', 'ACINCEX', 'ACVOL', 'ACASSHE', 'ACDEFJU', 'ACRC'],
          product_code: 'APP658',
          product_version: '2020-07-15',
          contractual_terms: '/docs/Appenin_Conditions_Generales_assurance_habitation_APP658.pdf',
          ipid: '/docs/Appenin_Document_Information_assurance_habitation_APP658.pdf'
        },
        special_operations_code: 'SEMESTER1',
        special_operations_code_applied_at: '2020-04-18T10:09:08.000Z',
        code: 'essca'
      })
    })

    it('should save the quote', async () => {
      // When
      response = await httpServer.api()
        .post('/v0/quotes')
        .send({ code: 'essca', risk: { property: { room_count: 2 } } })
        .set('X-Consumer-Username', 'essca')

      // Then
      const savedQuote = await QuoteSqlModel.findByPk(response.body.id)
      expect(savedQuote).not.to.be.undefined
    })
  })

  describe('PUT /v0/quotes/{id}', () => {
    let response: supertest.Response
    let quoteRepository: QuoteRepository
    const now: Date = new Date('2020-01-13T10:09:08Z')
    const quoteId: string = 'UD65X3A'
    const updateQuotePayload = {
      start_date: '2020-03-05',
      spec_ops_code: null,
      risk: {
        property: {
          room_count: 2,
          address: '90 rue de la nouvelle prairie',
          postal_code: '91100',
          city: 'Neo Kyukamura',
          type: 'FLAT'
        },
        person: {
          firstname: 'Jeannot',
          lastname: 'Lapin'
        },
        other_people: [
          {
            firstname: 'Samy',
            lastname: 'Aza'
          }
        ]
      },
      policy_holder: {
        firstname: 'Jeannot',
        lastname: 'Lapin',
        address: '90 rue de la nouvelle prairie',
        postal_code: '91100',
        city: 'Neo Kyukamura',
        email: 'jean.lapin@email.com',
        phone_number: '+33684205510'
      }
    }

    beforeEach(async () => {
      dateFaker.setCurrentDate(now)
      quoteRepository = new QuoteSqlRepository()
      const quote: Quote = createQuoteFixture(
        {
          id: quoteId,
          partnerCode: 'studyo',
          risk: createQuoteRiskFixture(
            {
              property: {
                roomCount: 1,
                address: '88 rue des prairies',
                postalCode: '91100',
                city: 'Kyukamura'
              },
              person: {
                firstname: 'Jean-Jean',
                lastname: 'Lapin'
              }
            }
          )
        }
      )
      await quoteRepository.save(quote)
    })

    afterEach(async () => {
      await resetDb()
    })

    it('should update the quote', async () => {
      // When
      response = await httpServer.api()
        .put(`/v0/quotes/${quoteId}`)
        .send(updateQuotePayload)
        .set('X-Consumer-Username', 'studyo')

      // Then
      const updatedQuote = await QuoteSqlModel.findByPk(response.body.id)
      expect(updatedQuote!.updatedAt.toUTCString())
        .is.equal(new Date('2020-01-13 10:09:08.000Z').toUTCString())
    })

    it('should return the quote', async () => {
      // When
      response = await httpServer.api()
        .put(`/v0/quotes/${quoteId}`)
        .send(updateQuotePayload)
        .set('X-Consumer-Username', 'studyo')

      // Then
      expect(response.body).to.deep.equal({
        code: 'studyo',
        id: 'UD65X3A',
        insurance: {
          contractual_terms: '/docs/Appenin_Conditions_Generales_assurance_habitation_APP658.pdf',
          currency: 'EUR',
          default_cap: 5000,
          default_deductible: 120,
          ipid: '/docs/Appenin_Document_Information_assurance_habitation_APP658.pdf',
          monthly_price: 7.5,
          product_code: 'APP658',
          product_version: '2020-07-15',
          simplified_covers: [
            'ACDDE',
            'ACINCEX',
            'ACVOL',
            'ACASSHE',
            'ACDEFJU',
            'ACRC'
          ]
        },
        nb_months_due: 12,
        policy_holder: {
          address: '90 rue de la nouvelle prairie',
          city: 'Neo Kyukamura',
          email: 'jean.lapin@email.com',
          firstname: 'Jeannot',
          lastname: 'Lapin',
          phone_number: '+33684205510',
          postal_code: '91100',
          email_validated_at: null
        },
        premium: 90,
        risk: {
          other_people: [
            {
              firstname: 'Samy',
              lastname: 'Aza'
            }
          ],
          person: {
            firstname: 'Jeannot',
            lastname: 'Lapin'
          },
          property: {
            address: '90 rue de la nouvelle prairie',
            city: 'Neo Kyukamura',
            postal_code: '91100',
            room_count: 2,
            type: 'FLAT'
          }
        },
        start_date: '2020-03-05',
        term_end_date: '2021-03-04',
        term_start_date: '2020-03-05'
      })
    })
  })

  describe('GET /v0/quotes/{id}', () => {
    afterEach(async () => {
      await resetDb()
    })
    it('should return the quote matching the given quoteId', async () => {
      // Given
      const quoteRepository = new QuoteSqlRepository()
      const quote: Quote = createQuoteFixture({
        partnerCode: 'studyo',
        risk: createQuoteRiskFixture({
          property: {
            address: '88 rue des prairies',
            city: 'Kyukamura',
            postalCode: '91100',
            roomCount: 2,
            type: PropertyType.FLAT
          }
        })
      })
      await quoteRepository.save(quote)

      const expectedResourceQuote = {
        id: 'UD65X3A',
        code: quote.partnerCode,
        risk: {
          property: {
            room_count: 2,
            address: '88 rue des prairies',
            postal_code: '91100',
            city: 'Kyukamura',
            type: 'FLAT'
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

      // When
      const response: supertest.Response = await httpServer.api()
        .get(`/v0/quotes/${quote.id}`)
        .set('X-Consumer-Username', quote.partnerCode)

      // Then
      expect(response.body).to.deep.equal(expectedResourceQuote)
    })
  })

  describe('POST /v0/quotes/{id}/policy-holder/send-email-validation-email', () => {
    let response: supertest.Response
    let quoteRepository: QuoteRepository
    const quoteId: string = 'UD65X3A'

    beforeEach(async () => {
      quoteRepository = new QuoteSqlRepository()
      const quote: Quote = createQuoteFixture(
        {
          id: quoteId,
          partnerCode: 'studyo'
        }
      )
      await quoteRepository.save(quote)
    })

    afterEach(async () => {
      await resetDb()
    })

    it('should send email validation email to quote policy holder', async () => {
      // When
      response = await httpServer.api()
        .post(`/v0/quotes/${quoteId}/policy-holder/send-email-validation-email`)
        .set('X-Consumer-Username', 'studyo')

      // Then
      expect(response.status).is.equal(204)
      expect(response.body).to.be.empty
    })
  })
})
