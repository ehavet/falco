import routes from './api/v0/quotes.api'
import { GetQuote } from './domain/get-quote.usecase'
import { QuoteSqlModel } from './infrastructure/quote-sql.model'
import { InsuranceSqlModel } from './infrastructure/insurance-sql.model'
import { RiskSqlModel } from './infrastructure/risk-sql.model'
import { QuoteSqlRepository } from './infrastructure/quote-sql.repository'
import { QuoteRepository } from './domain/quote.repository'
import { PartnerRepository } from '../partners/domain/partner.repository'
import { container as partnerContainer } from '../partners/partner.container'

export interface Container {
  GetQuote: GetQuote
}

const partnerRepository: PartnerRepository = partnerContainer.partnerRepository
const quoteRepository: QuoteRepository = new QuoteSqlRepository()
const getQuote: GetQuote = GetQuote.factory(quoteRepository, partnerRepository)

export const container: Container = {
  GetQuote: getQuote
}

export const quoteSqlModels: Array<any> = [QuoteSqlModel, InsuranceSqlModel, RiskSqlModel]

export function quoteRoutes () {
  return routes(container)
}
