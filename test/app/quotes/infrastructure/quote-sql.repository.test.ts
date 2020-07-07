import { QuoteSqlRepository } from '../../../../src/app/quotes/infrastructure/quote-sql.repository'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { QuoteSqlModel } from '../../../../src/app/quotes/infrastructure/quote-sql.model'
import { expect } from '../../../test-utils'
import { InsuranceSqlModel } from '../../../../src/app/quotes/infrastructure/insurance-sql.model'
import { RiskSqlModel } from '../../../../src/app/quotes/infrastructure/risk-sql.model'
import { createQuote } from '../fixtures/quote.fixture'
import { QuoteNotFoundError } from '../../../../src/app/quotes/domain/quote.errors'
import { PropertySqlModel } from '../../../../src/app/quotes/infrastructure/property-sql.model'

async function resetDb () {
  await QuoteSqlModel.destroy({ truncate: true, cascade: true })
}

describe('Repository - Quote', async () => {
  const quoteRepository = new QuoteSqlRepository()

  afterEach(async () => {
    await resetDb()
  })

  describe('#save', async () => {
    it('should save the quote into the db', async () => {
      // Given
      const quote: Quote = createQuote({ id: 'RF85D4S' })

      // When
      await quoteRepository.save(quote)

      // Then
      const result = await QuoteSqlModel.findAll({
        include: [{ model: InsuranceSqlModel }, { model: RiskSqlModel, include: [{ model: PropertySqlModel }] }]
      })

      expect(result).to.have.lengthOf(1)

      const savedQuote = result[0]
      expect(savedQuote.id).to.equal('RF85D4S')
      expect(savedQuote.partnerCode).to.equal('myPartner')
      expect(savedQuote.createdAt).to.be.an.instanceof(Date)
      expect(savedQuote.updatedAt).to.be.an.instanceof(Date)

      const savedRisk = savedQuote.risk
      expect(savedRisk).not.to.be.undefined
      expect(savedRisk.id).to.be.a('string')
      expect(savedRisk.property.roomCount).to.equal(2)
      expect(savedRisk.createdAt).to.be.an.instanceof(Date)
      expect(savedRisk.updatedAt).to.be.an.instanceof(Date)

      const savedInsurance = savedQuote.insurance
      expect(savedInsurance).not.to.be.undefined
      expect(savedInsurance.id).to.be.a('string')
      expect(savedInsurance.monthlyPrice).to.equal(5.82)
      expect(savedInsurance.defaultDeductible).to.equal(150)
      expect(savedInsurance.defaultCeiling).to.equal(7000)
      expect(savedInsurance.currency).to.equal('EUR')
      expect(savedInsurance.simplifiedCovers).to.include('ACDDE', 'ACVOL')
      expect(savedInsurance.productCode).to.equal('MRH-Loc-Etud')
      expect(savedInsurance.productVersion).to.equal('v2020-02-01')
      expect(savedInsurance.createdAt).to.be.an.instanceof(Date)
      expect(savedInsurance.updatedAt).to.be.an.instanceof(Date)
    })
  })

  describe('#get', async () => {
    it('should return the found quote', async () => {
      // Given
      const quoteInDb: Quote = createQuote({ id: 'DC82S0V' })

      await quoteRepository.save(quoteInDb)

      // When
      const foundQuote: Quote = await quoteRepository.get(quoteInDb.id)

      // Then
      expect(foundQuote).to.deep.equal(quoteInDb)
    })

    it('should throw an error if the quote does not exist', async () => {
      // Given
      const quoteId: string = 'JC7D89S'
      // When
      const getQuotePromise = quoteRepository.get(quoteId)

      // Then
      return expect(getQuotePromise).to.be.rejectedWith(QuoteNotFoundError, 'Quote with id JC7D89S cannot be found')
    })
  })
})
