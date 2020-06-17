import * as Boom from '@hapi/boom'
import Joi from '@hapi/joi'
import { ServerRoute } from '@hapi/hapi'
import { Container } from '../../partner.container'
import { GetPartnerByIdParams } from '../../domain/get-partner-by-id-params'
import { PartnerNotFoundError } from '../../domain/partner.errors'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'

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
              key: Joi.string().description('Partner key').example('myPartner')
            }).label('Partner'),
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request) => {
        const getPartnerInformationQuery: GetPartnerByIdParams = { partnerId: request.params.id.toString() }
        try {
          return await container.GetPartnerById(getPartnerInformationQuery)
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
