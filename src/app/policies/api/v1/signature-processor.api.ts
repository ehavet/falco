import { Container } from '../../policies.container'
import { ServerRoute } from '@hapi/hapi'
import Joi from 'joi'
import SignatureRequestEvent from '../../domain/signature/signature-request-event'
import { resourceToDomain } from './mappers/signature-request-event-resource-to-domain.mapper'
import * as Boom from '@hapi/boom'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'

const TAGS = ['api', '3 - Signature Processor']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/internal/v1/signature-processor/event-handler/',
      options: {
        tags: TAGS,
        description: 'Listen for signature processor notifications',
        payload: {
          output: 'data',
          parse: true,
          allow: 'multipart/form-data',
          multipart: {
            output: 'data'
          }
        },
        validate: {
          payload: Joi.object({
            json: Joi.any().meta({ swaggerType: 'file' }).required().description('Description of the event')
          })
        },
        response: {
          status: {
            200: Joi.string(),
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const payload: any = request.payload
        const signatureRequestEvent: SignatureRequestEvent = resourceToDomain(JSON.parse(payload.json))
        try {
          await container.ManageSignatureRequestEvent({ event: signatureRequestEvent })
        } catch (error) {
          throw Boom.internal(error)
        }
        return h.response('Hello API Event Received').code(200)
      }
    }
  ]
}
