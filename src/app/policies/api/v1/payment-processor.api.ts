import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import * as Boom from '@hapi/boom'
import { Container } from '../../policies.container'
import { ServerRoute } from '@hapi/hapi'
import { PolicyNotFoundError } from '../../domain/policies.errors'
import { UnauthenticatedEventError } from '../../domain/payment-processor.errors'
import { Stripe } from 'stripe'
import { requestToConfirmPaymentIntentCommand } from './mappers/create-confirm-payment-intent-command.mapper'

const TAGS = ['api', 'payment-processor']
export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/internal/v1/payment-processor/event-handler/',
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
        let parsedEvent: Stripe.Event

        try {
          parsedEvent = await container.PaymentEventAuthenticator.parse(rawEvent, rawSignature)
        } catch (error) {
          if (error instanceof UnauthenticatedEventError) {
            throw Boom.forbidden(error.message)
          } else {
            throw Boom.internal(error)
          }
        }

        if (parsedEvent.type === 'payment_intent.succeeded') {
          const paymentIntent = parsedEvent.data.object as Stripe.PaymentIntent
          try {
            const command = requestToConfirmPaymentIntentCommand(paymentIntent)
            await container.ConfirmPaymentIntentForPolicy(command)
            return h.response({}).code(204)
          } catch (error) {
            if (error instanceof PolicyNotFoundError) {
              throw Boom.notFound(error.message)
            } else {
              throw Boom.internal(error)
            }
          }
        }

        throw Boom.forbidden()
      }
    }
  ]
}
