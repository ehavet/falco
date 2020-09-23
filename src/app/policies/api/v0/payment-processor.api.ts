import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import * as Boom from '@hapi/boom'
import { Container } from '../../policies.container'
import { ServerRoute } from '@hapi/hapi'
import { PolicyNotFoundError } from '../../domain/policies.errors'
import { UnauthenticatedEventError } from '../../domain/payment-processor.errors'
import { ConfirmPaymentIntentCommand } from '../../domain/confirm-payment-intent-for-policy.usecase'
import { Payment } from '../../domain/payment/payment'

const TAGS = ['api', 'payment-processor']
export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/internal/v0/payment-processor/event-handler/',
      options: {
        payload: {
          output: 'data',
          parse: false
        },
        tags: TAGS,
        description: 'Listen for payment processor notifications',
        response: {
          status: {
            204: false,
            400: HttpErrorSchema.badRequestSchema,
            403: HttpErrorSchema.forbiddenSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const rawEvent = request.payload.toString()
        const rawSignature = request.raw.req.headers['stripe-signature']
        let event

        try {
          event = await container.PaymentEventAuthenticator.parse(rawEvent, rawSignature)
        } catch (error) {
          if (error instanceof UnauthenticatedEventError) {
            throw Boom.forbidden(error.message)
          } else {
            throw Boom.internal(error)
          }
        }

        if (event.type === 'payment_intent.succeeded') {
          try {
            const command: ConfirmPaymentIntentCommand = {
              policyId: event.data.object.metadata.policy_id,
              amount: event.data.object.amount,
              externalId: event.data.object.id,
              processor: Payment.Processor.STRIPE,
              instrument: Payment.Instrument.CREDITCARD
            }
            await container.ConfirmPaymentIntentForPolicy(command)
            return h.response({}).code(204)
          } catch (error) {
            if (error instanceof PolicyNotFoundError) {
              throw Boom.notFound(error.message)
            } else {
              throw Boom.internal(error)
            }
          }
        } else {
          throw Boom.forbidden()
        }
      }
    }
  ]
}
