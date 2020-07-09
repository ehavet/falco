import routes from './api/v0/quotes.api'
import { GetQuote } from './domain/get-quote.usecase'
import { QuoteSqlModel } from './infrastructure/quote-sql.model'
import { InsuranceSqlModel } from './infrastructure/insurance-sql.model'
import { RiskSqlModel } from './infrastructure/risk-sql.model'
import { QuoteSqlRepository } from './infrastructure/quote-sql.repository'
import { QuoteRepository } from './domain/quote.repository'
import { PartnerRepository } from '../partners/domain/partner.repository'
import { container as partnerContainer } from '../partners/partner.container'
import { PolicyHolderSqlModel } from './infrastructure/policy-holder-sql.model'
import { OtherInsuredSqlModel } from './infrastructure/other-insured-sql.model'
import { PropertySqlModel } from './infrastructure/property-sql.model'

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
  QuoteSqlModel, InsuranceSqlModel, RiskSqlModel, PropertySqlModel, PolicyHolderSqlModel, OtherInsuredSqlModel
]

export function quoteRoutes () {
  return routes(container)
}
