import { Container } from '../../policies.container'
import { ServerRoute } from '@hapi/hapi'
import Joi from '@hapi/joi'
import SignatureRequestEvent from '../../domain/signature/signature-request-event'
import { resourceToDomain } from './mappers/signature-request-event-resource-to-domain.mapper'
import { Logger } from '../../../../libs/logger'

const TAGS = ['api', 'signature-processor']
export default function (container: Container, logger: Logger): Array<ServerRoute> {
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
            200: Joi.string()
          }
        }
      },
      handler: async (request, h) => {
        const payload: any = request.payload
        const signatureRequestEvent: SignatureRequestEvent = resourceToDomain(JSON.parse(payload.json))
        container.ManageSignatureRequestEvent({ event: signatureRequestEvent })
          .catch(error => {
            // Here we just log and do not try to throw response error due to HelloSign errors management https://app.hellosign.com/api/eventsAndCallbacksWalkthrough
            logger.error(error)
          })
        return h.response('Hello API Event Received').code(200)
      }
    }
  ]
}
