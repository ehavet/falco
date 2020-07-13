import { EmailValidationQuery } from './email-validation-query'
import { ValidationTokenPayload } from './validation-token-payload'
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
        const validationTokenPayload: ValidationTokenPayload =
            _buildValidationTokenPayload(emailValidationQuery, config)
        const validationToken: string = encrypter.encrypt(JSON.stringify(validationTokenPayload))
        const emailValidationUri: string = _getEmailValidationUri(config.baseUrl, validationToken)
        await mailer.send(buildValidationLinkEmail(validationTokenPayload.email, emailValidationUri))
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
  config: ValidationLinkConfig
): ValidationTokenPayload {
  return {
    email: emailValidationQuery.email,
    callbackUrl: _getCallbackUrl(emailValidationQuery.callbackUrl, emailValidationQuery.partnerCode, emailValidationQuery.policyId, config),
    policyId: emailValidationQuery.policyId,
    expiredAt: _getExpirationDate(config.validityPeriodinMonth)
  }
}

function _getCallbackUrl (callbackUrl: string, partnerCode: string, policyId: string, config: ValidationLinkConfig) : string {
  if (callbackUrl && callbackUrl.length > 0) {
    return callbackUrl
  }
  return `${config.frontUrl}/${partnerCode}/${config.frontCallbackPageRoute}?policy_id=${policyId}`
}
