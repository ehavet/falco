import { EmailValidationQuery } from './email-validation-query'
import { Crypter } from './crypter'
import { Mailer } from '../../common-api/domain/mailer'
import { ValidationLinkConfig } from '../../../configs/validation-link.config'
import * as querystring from 'querystring'
import { buildValidationLinkEmail } from './validation-link.email'
import { EmailValidationQueryConsistencyError } from './email-validation.errors'
import { ValidationTokenPayload } from './validation-token-payload'

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
        if (_isQueryInconsistent(emailValidationQuery)) { throw new EmailValidationQueryConsistencyError() }
        const validationTokens = _buildValidationTokens(emailValidationQuery, config, encrypter)
        const emailValidationUriFr: string = _getEmailValidationUri(config.baseUrl, validationTokens.fr)
        const emailValidationUriEn: string = _getEmailValidationUri(config.baseUrl, validationTokens.en)
        await mailer.send(buildValidationLinkEmail(emailValidationQuery.email, emailValidationUriFr, emailValidationUriEn))
      }
    }
}

function _isQueryInconsistent (emailValidationQuery: EmailValidationQuery) {
  return !!(emailValidationQuery.policyId && emailValidationQuery.quoteId) ||
      !(emailValidationQuery.policyId || emailValidationQuery.quoteId)
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
): ValidationTokenPayload {
  const payload: ValidationTokenPayload = {
    email: emailValidationQuery.email,
    callbackUrl: _getCallbackUrl(emailValidationQuery, locale, config),
    expiredAt: _getExpirationDate(config.validityPeriodinMonth)
  }
  if (emailValidationQuery.policyId) payload.policyId = emailValidationQuery.policyId
  if (emailValidationQuery.quoteId) payload.quoteId = emailValidationQuery.quoteId
  return payload
}

function _getCallbackUrl (query: EmailValidationQuery, locale: string, config: ValidationLinkConfig) : string {
  if (query.callbackUrl && query.callbackUrl.length > 0) { return `${query.callbackUrl}` }
  if (query.policyId) {
    return `${config.frontUrl}/${locale}/${query.partnerCode}/${config.frontCallbackPageRoute}?policy_id=${query.policyId}`
  } else {
    return `${config.frontUrl}/${locale}/${query.partnerCode}/${config.frontCallbackPageRoute}?quote_id=${query.quoteId}`
  }
}
