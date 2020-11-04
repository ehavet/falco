import { Crypter } from './crypter'
import { ValidationToken } from './validation-token'
import { ValidationCallbackUri } from './validation-callback-uri'
import { ValidationTokenPayload } from './validation-token-payload'
import { ExpiredEmailValidationTokenError, BadEmailValidationToken } from './email-validation.errors'
import { BadDecryptError } from '../infrastructure/crypto.crypter'
import { PolicyRepository } from '../../policies/domain/policy.repository'
import { Policy } from '../../policies/domain/policy'

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

      const validationTokenPayload: ValidationTokenPayload = _buildValidationTokenPayload(validationTokenPayloadString)

      if (ValidationTokenPayload.isTokenInconsistent(validationTokenPayload)) {
        throw new BadEmailValidationToken(validationToken.token)
      }

      if (ValidationTokenPayload.isTokenExpired(validationTokenPayload)) {
        throw new ExpiredEmailValidationTokenError(validationToken.token)
      }

      if (validationTokenPayload.policyId) {
        const policy: Policy = await policyRepository.get(validationTokenPayload.policyId)
        if (Policy.emailNotValidatedYet(policy)) {
          await policyRepository.setEmailValidationDate(validationTokenPayload.policyId, new Date())
        }
      } else {
        throw Error('not implemented')
      }

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
    quoteId: validationTokenPayloadJson.quoteId,
    expiredAt: new Date(validationTokenPayloadJson.expiredAt)
  }
}
