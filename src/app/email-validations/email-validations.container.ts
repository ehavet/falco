import { SendValidationLinkToEmailAddress } from './domain/send-validation-link-to-email-address.usecase'
import routes from './api/v0/email-validations.api'
import { CryptoCrypter } from './infrastructure/crypto.crypter'
import { Crypter } from './domain/crypter'
import { Mailer } from '../common-api/domain/mailer'
import { GetValidationCallbackUriFromToken } from './domain/get-validation-callback-uri-from-token.usecase'
import { cryptoConfig } from '../../configs/crypto.config'
import { validationLinkConfig } from '../../configs/validation-link.config'
import { PolicyRepository } from '../policies/domain/policy.repository'
import { PolicySqlRepository } from '../policies/infrastructure/policy-sql.repository'
import { QuoteRepository } from '../quotes/domain/quote.repository'
import { QuoteSqlRepository } from '../quotes/infrastructure/quote-sql.repository'
import { HtmlTemplateEngine } from '../common-api/domain/html-template-engine'
import { container as commonApiContainer } from '../common-api/common-api.container'

export interface Container {
    SendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress
    GetValidationCallbackUriFromToken: GetValidationCallbackUriFromToken
}

// FIX Here we should not instanciate directly the repository but to retrieve it from the policies.container
// The thing is there is a cyclic dependency because the policy.container uses the SendValidationLinkToEmailAddress usecase
const policyRepository: PolicyRepository = new PolicySqlRepository()
const mailer: Mailer = commonApiContainer.mailer
const crypter: Crypter = new CryptoCrypter(cryptoConfig)
const quoteRepository: QuoteRepository = new QuoteSqlRepository()
const htmlTemplateEngine: HtmlTemplateEngine = commonApiContainer.htmlTemplateEngine

const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress = SendValidationLinkToEmailAddress.factory(crypter, mailer, validationLinkConfig, htmlTemplateEngine)
const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken = GetValidationCallbackUriFromToken.factory(crypter, policyRepository, quoteRepository)

export const container: Container = {
  SendValidationLinkToEmailAddress: sendValidationLinkToEmailAddress,
  GetValidationCallbackUriFromToken: getValidationCallbackUriFromToken
}

export function emailValidationsRoutes () {
  return routes(container)
}
