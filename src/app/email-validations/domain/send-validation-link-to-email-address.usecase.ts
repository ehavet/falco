import { EmailValidationQuery } from './email-validation-query'
import { ValidationTokenPayload } from './validation-token-payload'
import { Crypter } from './crypter'
import { Email, Mailer } from './mailer'
import { ValidationLinkConfig } from '../../../configs/validation-link.config'
import * as querystring from 'querystring'

export interface SendValidationLinkToEmailAddress {
    (emailValidationQuery: EmailValidationQuery): Promise<void>
}

export namespace SendValidationLinkToEmailAddress {
    export function factory (
      encrypter: Crypter,
      mailer: Mailer,
      config: ValidationLinkConfig
    ): SendValidationLinkToEmailAddress {
      return async (emailValidationQuery: EmailValidationQuery) => {
        const validationTokenPayload: ValidationTokenPayload =
            _buildValidationTokenPayload(emailValidationQuery, config.validityPeriodinMonth)
        const validationToken: string = encrypter.encrypt(JSON.stringify(validationTokenPayload))
        const emailValidationUri: string = _getEmailValidationUri(config.baseUrl, validationToken)
        await mailer.send(_buildValidationEmail(validationTokenPayload.email, emailValidationUri, config.emailSender))
      }
    }
}

function _getExpirationDate (validityPeriodInMonth: number): Date {
  const date = new Date()
  const utcDate = date.getUTCDate()
  date.setUTCMonth(date.getUTCMonth() + validityPeriodInMonth, 1)
  const utcMonth = date.getUTCMonth()
  date.setUTCDate(utcDate)
  if (date.getUTCMonth() !== utcMonth) date.setUTCDate(0)
  return date
}

function _getEmailValidationUri (url: string, validationToken: string): string {
  return `${url}?token=${querystring.escape(validationToken)}`
}

function _buildValidationTokenPayload (
  emailValidationQuery: EmailValidationQuery,
  validityPeriodInMonth: number
): ValidationTokenPayload {
  return {
    email: emailValidationQuery.email,
    callbackUrl: emailValidationQuery.callbackUrl,
    expiredAt: _getExpirationDate(validityPeriodInMonth)
  }
}

function _buildValidationEmail (recipientAddress: string, emailValidationUri: string, senderAddress: string): Email {
  return {
    sender: senderAddress,
    recipient: recipientAddress,
    subject: 'valider votre email',
    message: emailValidationUri
  }
}
