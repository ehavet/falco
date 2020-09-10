import routes from './api/v0/quotes.api'
import { GetQuote } from './domain/get-quote.usecase'
import { QuoteSqlRepository } from './infrastructure/quote-sql.repository'
import { QuoteRepository } from './domain/quote.repository'
import { PartnerRepository } from '../partners/domain/partner.repository'
import { container as partnerContainer } from '../partners/partner.container'
import { QuoteInsuranceSqlModel } from './infrastructure/sql-models/quote-insurance-sql.model'
import { QuoteRiskSqlModel } from './infrastructure/sql-models/quote-risk-sql.model'
import { QuotePropertySqlModel } from './infrastructure/sql-models/quote-property-sql.model'
import { QuoteRiskOtherPeopleSqlModel } from './infrastructure/sql-models/quote-risk-other-people-sql.model'
import { QuotePersonSqlModel } from './infrastructure/sql-models/quote-person-sql.model'
import { QuoteSqlModel } from './infrastructure/sql-models/quote-sql-model'

export interface Container {
  GetQuote: GetQuote
  quoteRepository: QuoteRepository
}

const partnerRepository: PartnerRepository = partnerContainer.partnerRepository
const quoteRepository: QuoteRepository = new QuoteSqlRepository()
const getQuote: GetQuote = GetQuote.factory(quoteRepository, partnerRepository)

export const container: Container = {
  GetQuote: getQuote,
  quoteRepository: quoteRepository
}

export const quoteSqlModels: Array<any> = [
  QuoteSqlModel, QuoteInsuranceSqlModel, QuoteRiskSqlModel,
  QuotePropertySqlModel, QuoteRiskOtherPeopleSqlModel, QuotePersonSqlModel
]

export function quoteRoutes () {
  return routes(container)
}
