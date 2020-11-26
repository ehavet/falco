import Joi from 'joi'
import { ServerRoute } from '@hapi/hapi'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import * as Boom from '@hapi/boom'
import { Container } from '../../policies.container'
import { PaymentIntentQuery } from '../../domain/payment-intent-query'
import {
  PolicyAlreadyPaidError,
  PolicyAlreadySignedError,
  PolicyCanceledError,
  PolicyNotFoundError,
  PolicyNotUpdatableError,
  PolicyStartDateConsistencyError,
  PolicyHolderMissingError,
  PolicyRiskPersonMissingError,
  PolicyHolderEmailValidationError,
  PolicyRiskPropertyMissingFieldError,
  PolicyHolderMissingPropertyError, CreatePolicyQuotePartnerOwnershipError
} from '../../domain/policies.errors'
import { QuoteNotFoundError } from '../../../quotes/domain/quote.errors'
import { CreatePolicyForQuoteCommand } from '../../domain/create-policy-for-quote-command'
import { policyToResource } from './mappers/policy-to-resource.mapper'
import { Policy } from '../../domain/policy'
import { createPolicyRequestSchema, policySchema } from './schemas/post-policy.schema'
import { GetPolicyQuery } from '../../domain/get-policy-query'
import { GeneratePolicyCertificateQuery } from '../../domain/certificate/generate-policy-certificate-query'
import { Certificate } from '../../domain/certificate/certificate'
import { PolicyForbiddenCertificateGenerationError } from '../../domain/certificate/certificate.errors'
import { GetPolicySpecificTermsQuery } from '../../domain/specific-terms/get-policy-specific-terms-query'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import { SpecificTermsNotFoundError } from '../../domain/specific-terms/specific-terms.errors'
import { ContractGenerationFailureError, SignatureRequestCreationFailureError, SpecificTermsGenerationFailureError } from '../../domain/signature-request.errors'
import { OperationCodeNotApplicableError } from '../../domain/operation-code.errors'
import { ApplySpecialOperationCodeCommand } from '../../domain/apply-special-operation-code-command'
import { PartnerNotFoundError } from '../../../partners/domain/partner.errors'
import { ApplyStartDateOnPolicyCommand } from '../../domain/apply-start-date-on-policy.usecase'

const TAGS = ['api', 'policies']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/v1/policies/{id}/payment-intents',
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
            409: HttpErrorSchema.conflictSchema,
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
          switch (true) {
            case error instanceof PolicyNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof PolicyCanceledError:
            case error instanceof PolicyAlreadyPaidError:
              throw Boom.conflict(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/v1/policies',
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
            422: HttpErrorSchema.unprocessableEntitySchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const payload: any = request.payload
        const headers: any = request.headers
        const partnerCode: string = headers['x-consumer-username']
        const quoteId: string = payload.quote_id
        const command: CreatePolicyForQuoteCommand = { partnerCode: partnerCode, quoteId: quoteId }

        try {
          const policy: Policy = await container.CreatePolicyForQuote(command)
          return h.response(policyToResource(policy)).code(201)
        } catch (error) {
          switch (true) {
            case error instanceof QuoteNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof PolicyHolderMissingError:
            case error instanceof PolicyRiskPersonMissingError:
            case error instanceof PolicyHolderMissingPropertyError:
            case error instanceof PolicyHolderEmailValidationError:
            case error instanceof PolicyRiskPropertyMissingFieldError:
            case error instanceof CreatePolicyQuotePartnerOwnershipError:
              throw Boom.badData(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/v1/policies/{id}',
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
      path: '/v1/policies/{id}/certificates',
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
            409: HttpErrorSchema.conflictSchema,
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
          switch (true) {
            case error instanceof PolicyNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof PolicyCanceledError:
            case error instanceof PolicyForbiddenCertificateGenerationError:
              throw Boom.conflict(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/v1/policies/{id}/specific-terms',
      options: {
        tags: TAGS,
        description: 'Retrieves the policy specific terms',
        validate: {
          params: Joi.object({
            id: Joi.string().min(12).max(12).required().description('Policy id').example('APP365094241')
          })
        },
        response: {
          status: {
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            409: HttpErrorSchema.conflictSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        },
        plugins: {
          'hapi-swagger': {
            responses: {
              201: {
                description: 'Specific Terms document',
                schema: Joi.binary().label('SpecificTerms ')
              }
            }
          }
        }
      },
      handler: async (request, h) => {
        const getPolicySpecificTermsQuery : GetPolicySpecificTermsQuery = { policyId: request.params.id }
        try {
          const specificTerms: SpecificTerms = await container.GetPolicySpecificTerms(getPolicySpecificTermsQuery)
          return h.response(specificTerms.buffer).bytes(specificTerms.buffer.length)
            .header('Content-Disposition', `attachment; filename=${specificTerms.name}`)
            .encoding('binary').code(200)
        } catch (error) {
          switch (true) {
            case error instanceof PolicyNotFoundError:
            case error instanceof SpecificTermsNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof PolicyCanceledError:
              throw Boom.conflict(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/v1/policies/{id}/signature-request',
      options: {
        tags: TAGS,
        description: 'Create a signature request',
        validate: {
          params: Joi.object({
            id: Joi.string().min(12).max(12).required().description('Policy id').example('APP365094241')
          })
        },
        response: {
          status: {
            201: Joi.object({
              url: Joi.string().uri().description('signature request url')
                .example('https://app.hellosign.com/editor/embeddedSign?signature_id=857915c9ca596')
            }),
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            409: HttpErrorSchema.conflictSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        try {
          const response = await container.CreateSignatureRequestForPolicy(request.params.id)
          return h.response(response).code(201)
        } catch (error) {
          switch (true) {
            case error instanceof SignatureRequestCreationFailureError:
            case error instanceof SpecificTermsGenerationFailureError:
            case error instanceof ContractGenerationFailureError:
              throw Boom.internal()
            case error instanceof PolicyNotFoundError:
            case error instanceof SpecificTermsNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof PolicyAlreadySignedError:
            case error instanceof PolicyCanceledError:
              throw Boom.conflict(error.message)
            default:
              throw Boom.internal()
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/v1/policies/{id}/apply-spec-ops-code',
      options: {
        tags: TAGS,
        description: 'Apply a special operation code on policy',
        validate: {
          params: Joi.object({
            id: Joi.string().min(12).max(12).required()
              .description('Policy id').example('APP365094241')
          }),
          payload: Joi.object({
            spec_ops_code: Joi.string().trim()
              .empty(['', null]).default('BLANK').max(100)
              .description('Special operation code').example('SPECIALCODE1')
          })
        },
        response: {
          status: {
            200: policySchema,
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            409: HttpErrorSchema.conflictSchema,
            422: HttpErrorSchema.unprocessableEntitySchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        try {
          const payload: any = request.payload
          const params: any = request.params
          const command: ApplySpecialOperationCodeCommand = {
            policyId: params.id,
            operationCode: payload.spec_ops_code
          }
          const updatedPolicy: Policy = await container.ApplySpecialOperationCodeOnPolicy(command)
          return h.response(policyToResource(updatedPolicy)).code(200)
        } catch (error) {
          switch (true) {
            case error instanceof OperationCodeNotApplicableError:
              throw Boom.badData(error.message)
            case error instanceof PolicyNotFoundError:
            case error instanceof PartnerNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof PolicyCanceledError:
            case error instanceof PolicyNotUpdatableError:
              throw Boom.conflict(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/v1/policies/{id}/change-start-date',
      options: {
        tags: TAGS,
        description: 'Apply start date update changes on policy',
        validate: {
          params: Joi.object({
            id: Joi.string().min(12).max(12).required()
              .description('Policy id').example('APP365094241')
          }),
          payload: Joi.object({
            start_date: Joi.date().required()
              .description('Policy start date').example('2020-04-26')
          })
        },
        response: {
          status: {
            200: policySchema,
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            409: HttpErrorSchema.conflictSchema,
            422: HttpErrorSchema.unprocessableEntitySchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        try {
          const payload: any = request.payload
          const params: any = request.params
          const command: ApplyStartDateOnPolicyCommand = {
            policyId: params.id,
            startDate: payload.start_date
          }
          const updatedPolicy: Policy = await container.ApplyStartDateOnPolicy(command)
          return h.response(policyToResource(updatedPolicy)).code(200)
        } catch (error) {
          switch (true) {
            case error instanceof PolicyStartDateConsistencyError:
              throw Boom.badData(error.message)
            case error instanceof PolicyNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof PolicyCanceledError:
            case error instanceof PolicyNotUpdatableError:
              throw Boom.conflict(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    }
  ]
}
