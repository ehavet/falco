import * as Boom from '@hapi/boom'
import Joi from '@hapi/joi'
import { ServerRoute } from '@hapi/hapi'
import { Container } from '../../partner-information.container'
import { GetPartnerInformationQuery } from '../../domain/get-partner-information-query'
import { PartnerInformationNotFoundError } from '../../domain/partner-information.errors'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'

const TAGS = ['api', 'partner-information']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'GET',
      path: '/v0/partner-information',
      options: {
        tags: TAGS,
        description: 'Information for a specific partner',
        validate: {
          query: Joi.object({
            name: Joi.string().description('Name of the partner').max(50).required().example('myPartner')
          })
        },
        response: {
          status: {
            200: Joi.object().empty().label('PartnerInformation'),
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema.description('Partner not found'),
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request) => {
        const getPartnerInformationQuery: GetPartnerInformationQuery = { name: request.query.name.toString() }
        try {
          return await container.GetPartnerInformation(getPartnerInformationQuery)
        } catch (error) {
          if (error instanceof PartnerInformationNotFoundError) {
            throw Boom.notFound(error.message)
          }
          throw Boom.internal(error)
        }
      }
    }
  ]
}
