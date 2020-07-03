import { SendValidationLinkToEmailAddress } from './domain/send-validation-link-to-email-address.usecase'
import routes from './api/v0/email-validations.api'
import { CryptoCrypter } from './infrastructure/crypto.crypter'
import { Crypter } from './domain/crypter'
import { Mailer } from './domain/mailer'
import { Nodemailer } from './infrastructure/nodemailer.mailer'
import { GetValidationCallbackUriFromToken } from './domain/get-validation-callback-uri-from-token.usecase'
import { cryptoConfig } from '../../configs/crypto.config'
import { validationLinkConfig } from '../../configs/validation-link.config'
import { nodemailerTransporter } from '../../libs/nodemailer'

export interface Container {
    SendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress
    GetValidationCallbackUriFromToken: GetValidationCallbackUriFromToken
}

const mailer: Mailer = new Nodemailer(nodemailerTransporter)
const crypter: Crypter = new CryptoCrypter(cryptoConfig)

const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress = SendValidationLinkToEmailAddress.factory(crypter, mailer, validationLinkConfig)
const getValidationCallbackUriFromToken: GetValidationCallbackUriFromToken = GetValidationCallbackUriFromToken.factory(crypter)

export const container: Container = {
  SendValidationLinkToEmailAddress: sendValidationLinkToEmailAddress,
  GetValidationCallbackUriFromToken: getValidationCallbackUriFromToken
}

export function emailValidationsRoutes () {
  return routes(container)
}
