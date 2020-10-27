import Joi from '@hapi/joi'
import { ServerRoute } from '@hapi/hapi'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import * as Boom from '@hapi/boom'
import { Container } from '../../email-validations.container'
import { ValidationToken } from '../../domain/validation-token'
import { ValidationCallbackUri } from '../../domain/validation-callback-uri'
import { ExpiredEmailValidationTokenError, BadEmailValidationToken } from '../../domain/email-validation.errors'
import { PolicyNotFoundError } from '../../../policies/domain/policies.errors'

const TAGS = ['api', 'email-validations']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/internal/v0/email-validations/validate',
      options: {
        tags: TAGS,
        description: 'Validate email address and return a associate callback url',
        validate: {
          payload: Joi.object({
            token: Joi.string().min(1).required()
              .description('Base64 encoded token').example('3NCRYPT3DB4S364STR1NG==')
          })
        },
        response: {
          status: {
            200: Joi.object({
              callback_url: Joi.string().uri().max(2000).example('http://my.callback.url.com')
            }),
            400: HttpErrorSchema.badRequestSchema,
            422: HttpErrorSchema.unprocessableEntitySchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const parsedJsonPayload = JSON.parse(JSON.stringify(request.payload))
        const validationToken: ValidationToken = { token: parsedJsonPayload.token.toString() }

        try {
          const validationCallbackUrl: ValidationCallbackUri =
            await container.GetValidationCallbackUriFromToken(validationToken)
          return h.response({ callback_url: validationCallbackUrl.callbackUrl }).code(200)
        } catch (error) {
          if (error instanceof BadEmailValidationToken ||
            error instanceof ExpiredEmailValidationTokenError ||
            error instanceof PolicyNotFoundError) {
            throw Boom.badData(error.message)
          }
          throw Boom.internal(error)
        }
      }
    }
  ]
}
