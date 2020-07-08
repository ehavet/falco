import Joi from '@hapi/joi'
import { ServerRoute } from '@hapi/hapi'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import * as Boom from '@hapi/boom'
import { Container } from '../../policies.container'
import { PaymentIntentQuery } from '../../domain/payment-intent-query'
import { PolicyNotFoundError } from '../../domain/policies.errors'
import { QuoteNotFoundError } from '../../../quotes/domain/quote.errors'
import { CreatePolicyCommand } from '../../domain/create-policy-command'
import { requestToCreatePolicyCommand } from './mappers/create-policy-command.mapper'
import { policyToResource } from './mappers/policy-to-resource.mapper'
import { Policy } from '../../domain/policy'
import { createPolicyRequestSchema, policySchema } from './schemas/post-policy.schema'

const TAGS = ['api', 'policies']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/v0/policies/{id}/payment-intents',
      options: {
        tags: TAGS,
        description: 'Create a payment intent',
        validate: {
          params: Joi.object({
            id: Joi.string().min(1).max(100).required()
              .description('Policy ID').example('APP485628503')
          })
        },
        response: {
          status: {
            200: Joi.object({
              id: Joi.string()
                .description('Payment intent id').example('pi_1GqKZZB099cSJ3oRvAiocs5r')
            }),
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const paymentIntentQuery: PaymentIntentQuery = {
          policyId: request.params.id
        }

        try {
          const paymentIntent = await container.CreatePaymentIntent(paymentIntentQuery)

          return h
            .response({ id: paymentIntent.id })
            .code(200)
        } catch (error) {
          if (error instanceof PolicyNotFoundError) {
            throw Boom.notFound(error.message)
          }
          throw Boom.internal(error)
        }
      }
    },
    {
      method: 'POST',
      path: '/v0/policies',
      options: {
        tags: TAGS,
        description: 'Creates a policy',
        validate: {
          payload: createPolicyRequestSchema
        },
        response: {
          status: {
            201: policySchema,
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const payload: any = request.payload
        const createPolicyCommand: CreatePolicyCommand = requestToCreatePolicyCommand(payload)
        try {
          const createdPolicy: Policy = await container.CreatePolicy(createPolicyCommand)
          return h.response(policyToResource(createdPolicy)).code(201)
        } catch (error) {
          if (error instanceof QuoteNotFoundError) {
            throw Boom.notFound(error.message)
          }
          throw Boom.internal(error)
        }
      }
    }
  ]
}
