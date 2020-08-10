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
              questions: Joi.object({
                room_count: Joi.object({
                  required: Joi.boolean().description('Question required or not').example(true),
                  options: Joi.array().description('Possible values').example([1, 2, 3])
                }).description('Question about the number of rooms of the property'),
                roommate: Joi.object({
                  available: Joi.boolean().description('Question to ask or not').example(false)
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
