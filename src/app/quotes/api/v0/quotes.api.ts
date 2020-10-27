import * as Boom from '@hapi/boom'
import { ServerRoute } from '@hapi/hapi'
import { CreateQuoteCommand } from '../../domain/create-quote-command'
import { quoteToResource } from './quote-to-resource.mapper'
import { Container } from '../../quote.container'
import { PartnerNotFoundError } from '../../../partners/domain/partner.errors'
import {
  NoPartnerInsuranceForRiskError,
  QuoteRiskPropertyRoomCountNotInsurableError,
  QuoteNotFoundError,
  QuoteRiskNumberOfRoommatesError,
  QuoteRiskRoommatesNotAllowedError,
  QuoteStartDateConsistencyError
} from '../../domain/quote.errors'
import Joi from '@hapi/joi'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import { quotePostRequestBodySchema } from './schemas/quotes-post-request.schema'
import { quotePutRequestBodySchema } from './schemas/quotes-put-request.schema'
import { quoteResponseBodySchema } from './schemas/quotes-response.schema'
import { UpdateQuoteCommand } from '../../domain/update-quote-command'
import { requestToUpdateQuoteCommand } from './mappers/request-to-update-quote-command.mapper'
import { updatedQuoteToResource } from './mappers/updated-quote-to-resource.mapper'
import { OperationCodeNotApplicableError } from '../../../policies/domain/operation-code.errors'

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
              risk: Joi.object({
                property: Joi.object({
                  room_count: Joi.number().integer().description('Property number of rooms').example(3)
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
        const payload: any = request.payload
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: payload.code, risk: { property: { roomCount: payload.risk.property.room_count } } }

        try {
          const quote = await container.CreateQuote(createQuoteCommand)
          const quoteAsResource = quoteToResource(quote)
          return h.response(quoteAsResource).code(201)
        } catch (error) {
          if (error instanceof PartnerNotFoundError) {
            throw Boom.notFound(error.message)
          }
          if (error instanceof NoPartnerInsuranceForRiskError) {
            throw Boom.badData(error.message)
          }

          throw Boom.internal(error)
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
            201: quoteResponseBodySchema,
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
    }

  ]
}
