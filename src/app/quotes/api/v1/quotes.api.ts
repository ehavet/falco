import * as Boom from '@hapi/boom'
import Joi from 'joi'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import { ServerRoute } from '@hapi/hapi'
import { CreateQuoteCommand } from '../../domain/create-quote-command'
import { Container } from '../../quote.container'
import { PartnerNotFoundError } from '../../../partners/domain/partner.errors'
import {
  NoPartnerInsuranceForRiskError,
  QuoteNotFoundError,
  QuotePartnerOwnershipError,
  QuotePolicyHolderEmailNotFoundError,
  QuoteRiskNumberOfRoommatesError,
  QuoteRiskOccupancyNotInsurableError,
  QuoteRiskPropertyRoomCountNotInsurableError,
  QuoteRiskPropertyTypeNotInsurableError,
  QuoteRiskRoommatesNotAllowedError,
  QuoteStartDateConsistencyError
} from '../../domain/quote.errors'
import { UpdateQuoteCommand } from '../../domain/update-quote-command'
import { OperationCodeNotApplicableError } from '../../../policies/domain/operation-code.errors'
import { quoteResponseBodySchema } from './schemas/quotes-response.schema'
import { requestToUpdateQuoteCommand } from './mappers/request-to-update-quote-command.mapper'
import { requestToCreateQuoteCommand } from './mappers/request-to-create-quote-command.mapper'
import { GetQuoteById } from '../../domain/get-quote-by-id.usecase'
import { commonHeadersSchema } from '../../../common-api/api/common-headers.schema'
import { quoteToResource } from './mappers/quote-to-resource.mapper'
import { quotePostRequestBodySchema, quotePutRequestBodySchema } from './schemas/quotes-request.schema'
import GetQuoteByIdQuery = GetQuoteById.GetQuoteByIdQuery

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/v1/quotes',
      options: {
        description: 'Create a quote',
        validate: {
          payload: quotePostRequestBodySchema
        },
        response: {
          status: {
            201: quoteResponseBodySchema,
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
          switch (true) {
            case error instanceof PartnerNotFoundError:
              throw Boom.notFound(error.message)
            case error instanceof NoPartnerInsuranceForRiskError:
            case error instanceof QuoteRiskPropertyRoomCountNotInsurableError:
            case error instanceof OperationCodeNotApplicableError:
            case error instanceof QuoteStartDateConsistencyError:
            case error instanceof QuoteRiskRoommatesNotAllowedError:
            case error instanceof QuoteRiskNumberOfRoommatesError:
            case error instanceof QuoteRiskPropertyTypeNotInsurableError:
            case error instanceof QuoteRiskOccupancyNotInsurableError:
              throw Boom.badData(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/v1/quotes/{id}/policy-holder/send-email-validation-email',
      options: {
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
      path: '/v1/quotes/{id}',
      options: {
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
          const quoteAsResource = quoteToResource(quote)
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
            case error instanceof QuoteRiskPropertyTypeNotInsurableError:
            case error instanceof QuoteRiskOccupancyNotInsurableError:
              throw Boom.badData(error.message)
            default:
              throw Boom.internal(error)
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/v1/quotes/{id}',
      options: {
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
          const quoteAsResource = quoteToResource(quote)
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
