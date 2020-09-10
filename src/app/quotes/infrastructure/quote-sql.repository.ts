import { QuoteRepository } from '../domain/quote.repository'
import { Quote } from '../domain/quote'
import { sqlToQuoteMapper } from './quote-sql.mapper'
import { QuoteNotFoundError } from '../domain/quote.errors'
import { QuoteInsuranceSqlModel } from './sql-models/quote-insurance-sql.model'
import { QuoteRiskSqlModel } from './sql-models/quote-risk-sql.model'
import { QuotePropertySqlModel } from './sql-models/quote-property-sql.model'
import { QuoteSqlModel } from './sql-models/quote-sql-model'

export class QuoteSqlRepository implements QuoteRepository {
  async save (quote: Quote): Promise<void> {
    const quoteSql = QuoteSqlModel.build({
      id: quote.id,
      partnerCode: quote.partnerCode,
      risk: {
        property: {
          roomCount: quote.risk.property.roomCount
        }
      },
      insurance: {
        monthlyPrice: quote.insurance.estimate.monthlyPrice,
        currency: quote.insurance.currency,
        defaultDeductible: quote.insurance.estimate.defaultDeductible,
        defaultCeiling: quote.insurance.estimate.defaultCeiling,
        simplifiedCovers: quote.insurance.simplifiedCovers,
        productCode: quote.insurance.productCode,
        productVersion: quote.insurance.productVersion,
        contractualTerms: quote.insurance.contractualTerms,
        ipid: quote.insurance.ipid
      }
    }, {
      include: [{
        model: QuoteInsuranceSqlModel
      },
      {
        model: QuoteRiskSqlModel,
        include: [{ model: QuotePropertySqlModel }]
      }]
    })

    await quoteSql.save()
  }

  async get (quoteId: string): Promise<Quote> {
    const quoteSql: QuoteSqlModel = await QuoteSqlModel
      .findByPk(quoteId, {
        include: [{ model: QuoteInsuranceSqlModel }, { model: QuoteRiskSqlModel, include: [{ model: QuotePropertySqlModel }] }],
        rejectOnEmpty: false
      })
    if (quoteSql) {
      return sqlToQuoteMapper(quoteSql)
    }
    throw new QuoteNotFoundError(quoteId)
  }
}
