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
import { GetPolicyQuery } from '../../domain/get-policy-query'
import { GeneratePolicyCertificateQuery } from '../../domain/certificate/generate-policy-certificate-query'
import { Certificate } from '../../domain/certificate/certificate'
import { CannotGeneratePolicyNotApplicableError } from '../../domain/certificate/certificate.errors'

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
            201: Joi.object({
              id: Joi.string().description('Payment intent id').example('pi_1GqKZZB099cSJ3oRvAiocs5r'),
              amount: Joi.number().description('Payment intent amount').example(99.99),
              currency: Joi.string().description('Payment intent currency').example('eur')
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
          const paymentIntent = await container.CreatePaymentIntentForPolicy(paymentIntentQuery)

          return h
            .response({
              id: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency
            })
            .code(201)
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
    },
    {
      method: 'GET',
      path: '/v0/policies/{id}',
      options: {
        tags: TAGS,
        description: 'Gets a policy',
        validate: {
          params: Joi.object({
            id: Joi.string().min(12).max(12).required().description('Policy id').example('APP365094241')
          })
        },
        response: {
          status: {
            200: policySchema,
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const getPolicyQuery: GetPolicyQuery = { policyId: request.params.id }
        try {
          const createdPolicy: Policy = await container.GetPolicy(getPolicyQuery)
          return h.response(policyToResource(createdPolicy)).code(200)
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
      path: '/v0/policies/{id}/certificates',
      options: {
        tags: TAGS,
        description: 'Creates a policy certificate',
        payload: {
          output: 'stream',
          defaultContentType: 'application/octet-stream'
        },
        validate: {
          params: Joi.object({
            id: Joi.string().min(12).max(12).required().description('Policy id').example('APP365094241')
          })
        },
        response: {
          status: {
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              201: {
                description: 'Certificate',
                schema: Joi.binary().label('Certificate ')
              }
            }
          }
        }
      },
      handler: async (request, h) => {
        const generatePolicyCertificateQuery : GeneratePolicyCertificateQuery = { policyId: request.params.id }
        try {
          const certificate: Certificate = await container.GeneragePolicyCertificate(generatePolicyCertificateQuery)
          return h.response(certificate.buffer).bytes(certificate.buffer.length)
            .header('Content-Disposition', `attachment; filename=${certificate.name}`)
            .encoding('binary').code(201)
        } catch (error) {
          if (error instanceof CannotGeneratePolicyNotApplicableError ||
              error instanceof PolicyNotFoundError) {
            throw Boom.badData(error.message)
          }
          throw Boom.internal(error)
        }
      }
    }
  ]
}
