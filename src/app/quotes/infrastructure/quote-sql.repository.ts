import { QuoteRepository } from '../domain/quote.repository'
import { Quote } from '../domain/quote'
import { QuoteSqlModel } from './quote-sql.model'
import { InsuranceSqlModel } from './insurance-sql.model'
import { RiskSqlModel } from './risk-sql.model'
import { sqlToQuoteMapper } from './quote-sql.mapper'
import { QuoteNotFoundError } from '../domain/quote.errors'

export class QuoteSqlRepository implements QuoteRepository {
  async save (quote: Quote): Promise<void> {
    const quoteSql = QuoteSqlModel.build({
      id: quote.id,
      partnerCode: quote.partnerCode,
      risk: {
        propertyRoomCount: quote.risk.property.roomCount
      },
      insurance: {
        monthlyPrice: quote.insurance.estimate.monthlyPrice,
        currency: quote.insurance.currency,
        defaultDeductible: quote.insurance.estimate.defaultDeductible,
        defaultCeiling: quote.insurance.estimate.defaultCeiling,
        simplifiedCovers: quote.insurance.simplifiedCovers,
        productCode: quote.insurance.productCode,
        productVersion: quote.insurance.productVersion
      }
    }, {
      include: [{
        model: InsuranceSqlModel
      },
      {
        model: RiskSqlModel
      }]
    })
    await quoteSql.save()
  }

  async get (quoteId: string): Promise<Quote> {
    const quoteSql: QuoteSqlModel = await QuoteSqlModel
      .findByPk(quoteId, {
        include: [{ model: InsuranceSqlModel }, { model: RiskSqlModel }],
        rejectOnEmpty: false
      })
    if (quoteSql) {
      return sqlToQuoteMapper(quoteSql)
    }
    throw new QuoteNotFoundError(quoteId)
  }
}
