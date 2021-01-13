import routes from './api/v0/quotes.api'
import { CreateQuote } from './domain/create-quote.usecase'
import { QuoteSqlRepository } from './infrastructure/quote-sql.repository'
import { QuoteRepository } from './domain/quote.repository'
import { PartnerRepository } from '../partners/domain/partner.repository'
import { container as partnerContainer } from '../partners/partner.container'
import { container as emailValidationContainer } from '../email-validations/email-validations.container'
import { QuoteInsuranceSqlModel } from './infrastructure/sql-models/quote-insurance-sql.model'
import { QuoteRiskSqlModel } from './infrastructure/sql-models/quote-risk-sql.model'
import { QuotePropertySqlModel } from './infrastructure/sql-models/quote-property-sql.model'
import { QuoteRiskOtherPeopleSqlModel } from './infrastructure/sql-models/quote-risk-other-people-sql.model'
import { QuotePersonSqlModel } from './infrastructure/sql-models/quote-person-sql.model'
import { QuoteSqlModel } from './infrastructure/sql-models/quote-sql-model'
import { UpdateQuote } from './domain/update-quote.usecase'
import { SendValidationLinkEmailToQuotePolicyHolder } from './domain/send-validation-link-email-to-quote-policy-holder.usecase'
import { GetQuoteById } from './domain/get-quote-by-id.usecase'
import { DefaultCapAdviceSqlModel } from './infrastructure/default-cap-advice/default-cap-advice-sql.model'
import { DefaultCapAdviceRepository } from './domain/default-cap-advice/default-cap-advice.repository'
import { DefaultCapAdviceSqlRepository } from './infrastructure/default-cap-advice/default-cap-advice-sql.repository'
import { PricingMatrixSqlModel } from './infrastructure/cover-monthly-price/pricing-matrix-sql.model'
import { CoverMonthlyPriceSqlRepository } from './infrastructure/cover-monthly-price/cover-monthly-price-sql.repository'

export interface Container {
  CreateQuote: CreateQuote
  UpdateQuote: UpdateQuote
  GetQuoteById: GetQuoteById
  quoteRepository: QuoteRepository
  SendValidationLinkEmailToQuotePolicyHolder: SendValidationLinkEmailToQuotePolicyHolder
}

const partnerRepository: PartnerRepository = partnerContainer.partnerRepository
const quoteRepository: QuoteRepository = new QuoteSqlRepository()
const defaultCapAdviceRepository: DefaultCapAdviceRepository = new DefaultCapAdviceSqlRepository()
const coverMonthlyPriceSqlRepository = new CoverMonthlyPriceSqlRepository()
const sendEmailValidationLinkToQuotePolicyHolder: SendValidationLinkEmailToQuotePolicyHolder =
    SendValidationLinkEmailToQuotePolicyHolder.factory(
      quoteRepository,
      partnerRepository,
      emailValidationContainer.SendValidationLinkToEmailAddress
    )
const createQuote: CreateQuote = CreateQuote.factory(quoteRepository, partnerRepository, defaultCapAdviceRepository, coverMonthlyPriceSqlRepository)
const updateQuote: UpdateQuote = UpdateQuote.factory(quoteRepository, partnerRepository, defaultCapAdviceRepository, coverMonthlyPriceSqlRepository)
const getQuoteById: GetQuoteById = GetQuoteById.factory(quoteRepository)

export const container: Container = {
  CreateQuote: createQuote,
  UpdateQuote: updateQuote,
  GetQuoteById: getQuoteById,
  quoteRepository: quoteRepository,
  SendValidationLinkEmailToQuotePolicyHolder: sendEmailValidationLinkToQuotePolicyHolder
}

export const quoteSqlModels: Array<any> = [
  QuoteSqlModel, QuoteInsuranceSqlModel, QuoteRiskSqlModel,
  QuotePropertySqlModel, QuoteRiskOtherPeopleSqlModel, QuotePersonSqlModel,
  DefaultCapAdviceSqlModel, PricingMatrixSqlModel
]

export function quoteRoutes () {
  return routes(container)
}
