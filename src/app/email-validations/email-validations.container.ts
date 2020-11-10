import { SendValidationLinkToEmailAddress } from './domain/send-validation-link-to-email-address.usecase'
import routes from './api/v0/email-validations.api'
import { CryptoCrypter } from './infrastructure/crypto.crypter'
import { Crypter } from './domain/crypter'
import { Mailer } from '../common-api/domain/mailer'
import { Nodemailer } from '../common-api/infrastructure/nodemailer.mailer'
import { GetValidationCallbackUriFromToken } from './domain/get-validation-callback-uri-from-token.usecase'
import { cryptoConfig } from '../../configs/crypto.config'
import { validationLinkConfig } from '../../configs/validation-link.config'
import { nodemailerTransporter } from '../../libs/nodemailer'
import { PolicyRepository } from '../policies/domain/policy.repository'
import { PolicySqlRepository } from '../policies/infrastructure/policy-sql.repository'
import { QuoteRepository } from '../quotes/domain/quote.repository'
import { QuoteSqlRepository } from '../quotes/infrastructure/quote-sql.repository'

export interface Container {
    SendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress
    GetValidationCallbackUriFromToken: GetValidationCallbackUriFromToken
}

// FIX Here we should not instanciate directly the repository but to retrieve it from the policies.container
// The thing is there is a cyclic dependency because the policy.container uses the SendValidationLinkToEmailAddress usecase
const policyRepository: PolicyRepository = new PolicySqlRepository()
const mailer: Mailer = new Nodemailer(nodemailerTransporter)
const crypter: Crypter = new CryptoCrypter(cryptoConfig)
const quoteRepository: QuoteRepository = new QuoteSqlRepository()

const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress = SendValidationLinkToEmailAddress.factory(crypter, mailer, validationLinkConfig)
const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken = GetValidationCallbackUriFromToken.factory(crypter, policyRepository, quoteRepository)

export const container: Container = {
  SendValidationLinkToEmailAddress: sendValidationLinkToEmailAddress,
  GetValidationCallbackUriFromToken: getValidationCallbackUriFromToken
}

export function emailValidationsRoutes () {
  return routes(container)
}
