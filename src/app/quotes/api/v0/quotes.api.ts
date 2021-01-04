import * as Boom from '@hapi/boom'
import Joi from 'joi'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import { ServerRoute } from '@hapi/hapi'
import { CreateQuoteCommand } from '../../domain/create-quote-command'
import { quoteToResource } from './quote-to-resource.mapper'
import { Container } from '../../quote.container'
import { PartnerNotFoundError } from '../../../partners/domain/partner.errors'
import {
  NoPartnerInsuranceForRiskError,
  QuoteNotFoundError, QuotePartnerOwnershipError,
  QuotePolicyHolderEmailNotFoundError,
  QuoteRiskNumberOfRoommatesError,
  QuoteRiskPropertyRoomCountNotInsurableError,
  QuoteRiskRoommatesNotAllowedError,
  QuoteStartDateConsistencyError
} from '../../domain/quote.errors'
import { UpdateQuoteCommand } from '../../domain/update-quote-command'
import { updatedQuoteToResource } from './mappers/updated-quote-to-resource.mapper'
import { OperationCodeNotApplicableError } from '../../../policies/domain/operation-code.errors'
import { quoteResponseBodySchema } from './schemas/quotes-response.schema'
import { quotePutRequestBodySchema } from './schemas/quotes-put-request.schema'
import { quotePostRequestBodySchema } from './schemas/quotes-post-request.schema'
import { requestToUpdateQuoteCommand } from './mappers/request-to-update-quote-command.mapper'
import { requestToCreateQuoteCommand } from './mappers/request-to-create-quote-command.mapper'
import { GetQuoteById } from '../../domain/get-quote-by-id.usecase'
import { POSTALCODE_REGEX } from '../../../common-api/domain/regexp'
import { commonHeadersSchema } from '../../../common-api/api/common-headers.schema'
import GetQuoteByIdQuery = GetQuoteById.GetQuoteByIdQuery

const TAGS = ['api', 'quotes']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/v0/quotes',
      options: {
        tags: TAGS,
        description: 'Create a quote',
        validate: {
          payload: quotePostRequestBodySchema
        },
        response: {
          status: {
            201: Joi.object({
              id: Joi.string().description('Quote id').example('DU6C73X'),
              code: Joi.string().description('Code').example('myCode'),
              special_operations_code: Joi.string().allow(null).description('Operation special code applied').example('CODEPROMO1'),
              special_operations_code_applied_at: Joi.date().allow(null).description('Application date of operation special code').example('1957-03-02T10:09:09.000'),
              risk: Joi.object({
                property: Joi.object({
                  room_count: Joi.number().integer().description('Property number of rooms').example(3),
                  address: Joi.string().optional().description('Property address').example('112 rue du chêne rouge'),
                  postal_code: Joi.string().optional().regex(POSTALCODE_REGEX).description('Property postal code').example('95470'),
                  city: Joi.string().optional().max(50).description('Property city').example('Corbeil-Essonnes'),
                  type: Joi.string().optional().description('The type of property').example('FLAT')
                }).description('Risks regarding the property').label('Risk.Property')
              }).description('Risks').label('Risk'),
              insurance: Joi.object({
                monthly_price: Joi.number().precision(2).description('Monthly price').example(5.43),
                default_deductible: Joi.number().precision(2).integer().description('Default deductible').example(150),
                default_ceiling: Joi.number().precision(2).description('Default ceiling').example(5000),
                currency: Joi.string().description('Monthly price currency').example('EUR'),
                simplified_covers: Joi.array().items(Joi.string()).description('Simplified covers').example(['ACDDE', 'ACVOL']),
                product_code: Joi.string().description('Product code').example('MRH-Loc-Etud'),
                product_version: Joi.string().description('Date of the product').example('v2020-02-01'),
                contractual_terms: Joi.string().description('Link to the Contractual Terms document').example('http://link/to.ct'),
                ipid: Joi.string().description('Link to the IPID document').example('http://link/to.ipid')
              }).description('Insurance').label('Quote.Insurance')
            }).label('Quote'),
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            422: HttpErrorSchema.unprocessableEntitySchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const createQuoteCommand: CreateQuoteCommand = requestToCreateQuoteCommand(request)
        try {
          const quote = await container.CreateQuote(createQuoteCommand)
          const quoteAsResource = quoteToResource(quote)
          return h.response(quoteAsResource).code(201)
        } catch (error) {
          if (error instanceof PartnerNotFoundError) {
            throw Boom.notFound(error.message)
          }
          if (error instanceof NoPartnerInsuranceForRiskError || error instanceof OperationCodeNotApplicableError) {
            throw Boom.badData(error.message)
          }

          throw Boom.internal(error.message)
        }
      }
    },
    {
      method: 'POST',
      path: '/v0/quotes/{id}/policy-holder/send-email-validation-email',
      options: {
        tags: TAGS,
        description: 'send an email with a link to validate quote policy holder email address',
        validate: {
          params: Joi.object({
            id: Joi.string().min(6).max(12).required().description('Quote id').example('DU6C73X')
          })
        },
        response: {
          status: {
            204: Joi.object({}),
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            409: HttpErrorSchema.conflictSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        try {
          const quoteId: string = request.params.id
          await container.SendValidationLinkEmailToQuotePolicyHolder(quoteId)
          return h.response({}).code(204)
        } catch (error) {
          switch (true) {
            case error instanceof QuoteNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof QuotePolicyHolderEmailNotFoundError:
              throw Boom.conflict(error.message)
            default:
              throw Boom.internal(error.message)
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/v0/quotes/{id}',
      options: {
        tags: TAGS,
        description: 'Update a quote',
        validate: {
          params: Joi.object({
            id: Joi.string().min(6).max(12).required().description('Quote id').example('DU6C73X')
          }),
          payload: quotePutRequestBodySchema
        },
        response: {
          status: {
            200: quoteResponseBodySchema,
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            422: HttpErrorSchema.unprocessableEntitySchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const updateQuoteCommand: UpdateQuoteCommand = requestToUpdateQuoteCommand(request)

        try {
          const quote = await container.UpdateQuote(updateQuoteCommand)
          const quoteAsResource = updatedQuoteToResource(quote)
          return h.response(quoteAsResource).code(200)
        } catch (error) {
          switch (true) {
            case error instanceof PartnerNotFoundError:
            case error instanceof QuoteNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof QuoteRiskPropertyRoomCountNotInsurableError:
            case error instanceof OperationCodeNotApplicableError:
            case error instanceof QuoteStartDateConsistencyError:
            case error instanceof QuoteRiskRoommatesNotAllowedError:
            case error instanceof QuoteRiskNumberOfRoommatesError:
              throw Boom.badData(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/v0/quotes/{id}',
      options: {
        tags: TAGS,
        description: 'Gets a quote',
        validate: {
          params: Joi.object({
            id: Joi.string().min(6).max(12).required().description('Quote id').example('DU6C73X')
          }),
          headers: commonHeadersSchema
        },
        response: {
          status: {
            200: quoteResponseBodySchema,
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        const headers: any = request.headers
        const partnerCode: string = headers['x-consumer-username']
        const query: GetQuoteByIdQuery = { quoteId: request.params.id, partnerCode }

        try {
          const quote = await container.GetQuoteById(query)
          const quoteAsResource = updatedQuoteToResource(quote)
          return h.response(quoteAsResource).code(200)
        } catch (error) {
          switch (true) {
            case error instanceof QuoteNotFoundError:
            case error instanceof QuotePartnerOwnershipError:
              throw Boom.notFound(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    }
  ]
}
