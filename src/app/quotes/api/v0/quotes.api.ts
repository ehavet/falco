import * as Boom from '@hapi/boom'
import { ServerRoute } from '@hapi/hapi'
import { GetQuoteQuery } from '../../domain/get-quote-query'
import { quoteToResource } from './quote-to-resource.mapper'
import { Container } from '../../quote.container'
import { PartnerNotFoundError } from '../../../partners/domain/partner.errors'
import { NoPartnerInsuranceForRiskError } from '../../domain/quote.errors'
import Joi from '@hapi/joi'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'

const TAGS = ['api', 'quotes']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/v0/quotes',
      options: {
        tags: TAGS,
        description: 'Get a quote',
        validate: {
          payload: Joi.object({
            code: Joi.string().required().description('Code').example('myCode'),
            risk: Joi.object({
              property: Joi.object({
                room_count: Joi.number().integer().max(5).required().description('Property number of rooms').example(3)
              }).required().description('Risks regarding the property').label('Risk.Property')
            }).required().description('Risks').label('Risk')
          }).options({ stripUnknown: true })
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
        const getQuoteQuery: GetQuoteQuery = { partnerCode: payload.code, risk: { property: { roomCount: payload.risk.property.room_count } } }

        try {
          const quote = await container.GetQuote(getQuoteQuery)
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
    }
  ]
}
