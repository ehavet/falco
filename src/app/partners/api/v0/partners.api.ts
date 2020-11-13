import * as Boom from '@hapi/boom'
import Joi from '@hapi/joi'
import { ServerRoute } from '@hapi/hapi'
import { Container } from '../../partner.container'
import { GetPartnerByCodeQuery } from '../../domain/get-partner-by-code-query'
import { PartnerNotFoundError } from '../../domain/partner.errors'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import { partnerToResource } from './partner-to-resource.mapper'

const TAGS = ['api', 'partners']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'GET',
      path: '/internal/v0/partners/{id}',
      options: {
        tags: TAGS,
        description: 'Information for a specific partner',
        validate: {
          params: Joi.object({
            id: Joi.string().min(2).max(50).not('').required()
              .description('Partner ID').example('partner_id')
          })
        },
        response: {
          status: {
            200: Joi.object({
              code: Joi.string().description('Partner code').example('myPartner'),
              translation_key: Joi.string().description('Partner translation key').example('myPartnerTranslationKey'),
              customer_support_email: Joi.string().description('Partner customer support email').example('customersupport@mypartner.com'),
              questions: Joi.object({
                room_count: Joi.object({
                  options: Joi.array().description('Possible values').example([1, 2, 3]),
                  manage_other_cases: Joi.boolean().description('Manage other cases for not proposed rooms').example(true)
                }).description('Question about the number of rooms of the property'),
                roommate: Joi.object({
                  applicable: Joi.boolean().description('Define if the question is applicable for the partner. If not, do not ask the question to the subscriber otherwise an error could be thrown when creating a policy').example(false),
                  maximum_numbers: Joi.array().optional().items(
                    Joi.object({
                      room_count: Joi.number().description('Room count targeted by the limitation of roommates').example(3),
                      value: Joi.number().description('Number maximum of roommates').example(2)
                    }).optional().description('Number Maximum of roommates for one room count')
                  ).description('Number maxixmum of roommates regarding the different partner room counts. Only present if the question is applicable.')
                }).description('Question about the possibility of roommates for the insured property')
              }).description('List of questions to ask for the quote')
            }).label('Partner'),
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request) => {
        const getPartnerByCodeQuery: GetPartnerByCodeQuery = { partnerCode: request.params.id.toString() }
        try {
          const partner = await container.GetPartnerByCode(getPartnerByCodeQuery)
          return partnerToResource(partner)
        } catch (error) {
          if (error instanceof PartnerNotFoundError) {
            throw Boom.notFound(error.message)
          }
          throw Boom.internal(error)
        }
      }
    }
  ]
}
