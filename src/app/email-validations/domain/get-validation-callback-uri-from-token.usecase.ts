import { Crypter } from './crypter'
import { ValidationToken } from './validation-token'
import { ValidationCallbackUri } from './validation-callback-uri'
import { ValidationTokenPayload } from './validation-token-payload'
import { ExpiredEmailValidationTokenError, BadEmailValidationToken } from './email-validation.errors'
import { BadDecryptError } from '../infrastructure/crypto.crypter'
import { PolicyRepository } from '../../policies/domain/policy.repository'

export interface GetValidationCallbackUriFromToken {
    (validationToken: ValidationToken): Promise<ValidationCallbackUri>
}

export namespace GetValidationCallbackUriFromToken {
  export function factory (decrypter: Crypter, policyRepository: PolicyRepository): GetValidationCallbackUriFromToken {
    return async (validationToken: ValidationToken) => {
      let validationTokenPayloadString: string

      try {
        validationTokenPayloadString = decrypter.decrypt(validationToken.token)
      } catch (error) {
        if (error instanceof BadDecryptError) {
          throw new BadEmailValidationToken(validationToken.token)
        }
        throw error
      }

      const validationTokenPayload: ValidationTokenPayload =
            _buildValidationTokenPayload(validationTokenPayloadString)

      if (_isTokenExpired(validationTokenPayload)) {
        throw new ExpiredEmailValidationTokenError(validationToken.token)
      }

      await policyRepository.setEmailValidationDate(new Date())

      return { callbackUrl: validationTokenPayload.callbackUrl }
    }
  }
}

function _buildValidationTokenPayload (validationTokenPayloadString: string): ValidationTokenPayload {
  const validationTokenPayloadJson = JSON.parse(validationTokenPayloadString)
  return {
    email: validationTokenPayloadJson.email,
    callbackUrl: validationTokenPayloadJson.callbackUrl,
    policyId: validationTokenPayloadJson.policyId,
    expiredAt: new Date(validationTokenPayloadJson.expiredAt)
  }
}

function _isTokenExpired (validationTokenPayload: ValidationTokenPayload) {
  return (validationTokenPayload.expiredAt < new Date())
}
