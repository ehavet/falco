import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import { Container } from '../../policies.container'
import { ServerRoute } from '@hapi/hapi'
import Joi from '@hapi/joi'
import { logger } from '../../../../libs/logger'

const TAGS = ['api', 'signature-processor']
export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/internal/v0/signature-processor/event-handler/',
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
        response: {
          status: {
            200: Joi.string(),
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const payload: any = request.payload
        const signatureEvent = JSON.parse(payload.json)
        try {
          await container.ManageSignatureEvent({ event: signatureEvent })
        } catch (error) {
          // Here we do not try to throw an error due to HelloSign errors management https://app.hellosign.com/api/eventsAndCallbacksWalkthrough
          logger.error(error)
        }
        return h.response('Hello API Event Received').code(200)
      }
    }
  ]
}
