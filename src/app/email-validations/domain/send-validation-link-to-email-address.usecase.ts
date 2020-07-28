import { EmailValidationQuery } from './email-validation-query'
import { Crypter } from './crypter'
import { Mailer } from '../../common-api/domain/mailer'
import { ValidationLinkConfig } from '../../../configs/validation-link.config'
import * as querystring from 'querystring'
import { buildValidationLinkEmail } from './validation-link.email'

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
        const validationTokens = _buildValidationTokens(emailValidationQuery, config, encrypter)
        const emailValidationUriFr: string = _getEmailValidationUri(config.baseUrl, validationTokens.fr)
        const emailValidationUriEn: string = _getEmailValidationUri(config.baseUrl, validationTokens.en)
        await mailer.send(buildValidationLinkEmail(emailValidationQuery.email, emailValidationUriFr, emailValidationUriEn))
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

function _getEmailValidationUri (url: string, validationToken: string) {
  return `${url}?token=${querystring.escape(validationToken)}`
}

function _buildValidationTokens (
  emailValidationQuery: EmailValidationQuery,
  config: ValidationLinkConfig,
  encrypter: Crypter
) {
  const tokenByLocale = config.locales.map((locale) => {
    return {
      [locale]: encrypter.encrypt(
        JSON.stringify(_buildValidationTokenPayload(emailValidationQuery, config, locale))
      )
    }
  })
  return tokenByLocale.reduce(
    (accumulator, token) => { return { ...accumulator, ...token } }
  )
}

function _buildValidationTokenPayload (
  emailValidationQuery: EmailValidationQuery,
  config: ValidationLinkConfig,
  locale: string
) {
  return {
    email: emailValidationQuery.email,
    callbackUrl: _getCallbackUrl(emailValidationQuery.callbackUrl, locale, emailValidationQuery.partnerCode, emailValidationQuery.policyId, config),
    policyId: emailValidationQuery.policyId,
    expiredAt: _getExpirationDate(config.validityPeriodinMonth)
  }
}

function _getCallbackUrl (callbackUrl: string, locale: string, partnerCode: string, policyId: string, config: ValidationLinkConfig) : string {
  if (callbackUrl && callbackUrl.length > 0) {
    return `${callbackUrl}`
  }
  return `${config.frontUrl}/${locale}/${partnerCode}/${config.frontCallbackPageRoute}?policy_id=${policyId}`
}
