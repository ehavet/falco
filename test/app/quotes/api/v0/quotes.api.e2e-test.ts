import * as supertest from 'supertest'
import { dateFaker, expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'
import { QuoteSqlModel } from '../../../../../src/app/quotes/infrastructure/sql-models/quote-sql-model'
import { QuoteRepository } from '../../../../../src/app/quotes/domain/quote.repository'
import { QuoteSqlRepository } from '../../../../../src/app/quotes/infrastructure/quote-sql.repository'
import { Quote } from '../../../../../src/app/quotes/domain/quote'
import { createQuoteFixture, createQuoteRiskFixture } from '../../fixtures/quote.fixture'

async function resetDb () {
  await QuoteSqlModel.destroy({ truncate: true, cascade: true })
}

describe('Http API quotes e2e', async () => {
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
        .send({ code: 'studyo', risk: { property: { room_count: 2 } } })
        .set('X-Consumer-Username', 'studyo')

      // Then
      expect(response.body).to.deep.equal({
        id: response.body.id,
        risk: {
          property: {
            room_count: 2
          }
        },
        insurance: {
          monthly_price: 7.50,
          currency: 'EUR',
          default_deductible: 120,
          default_ceiling: 5000,
          simplified_covers: ['ACDDE', 'ACINCEX', 'ACVOL', 'ACASSHE', 'ACDEFJU', 'ACRC'],
          product_code: 'APP658',
          product_version: '2020-07-15',
          contractual_terms: '/docs/Appenin_Conditions_Generales_assurance_habitation_APP658.pdf',
          ipid: '/docs/Appenin_Document_Information_assurance_habitation_APP658.pdf'
        },
        code: 'studyo'
      })
    })

    it('should return the quote with special operations code', async () => {
      // When
      response = await httpServer.api()
        .post('/v0/quotes')
        .send({ code: 'essca', risk: { property: { room_count: 2 } }, spec_ops_code: 'SEMESTER1' })
        .set('X-Consumer-Username', 'essca')

      // Then
      expect(response.body).to.deep.equal({
        id: response.body.id,
        risk: {
          property: {
            room_count: 2
          }
        },
        insurance: {
          monthly_price: 6.34,
          currency: 'EUR',
          default_deductible: 120,
          default_ceiling: 3000,
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
          city: 'Neo Kyukamura'
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
      expect(updatedQuote.updatedAt.toUTCString())
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
            room_count: 2
          }
        },
        start_date: '2020-03-05',
        term_end_date: '2021-03-04',
        term_start_date: '2020-03-05'
      })
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
