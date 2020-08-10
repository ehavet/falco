import { Container } from '../../common-api/common-api.container'
import { ServerRoute } from '@hapi/hapi'
import Joi from '@hapi/joi'
import * as HttpErrorSchema from '../HttpErrorSchema'
import * as Boom from '@hapi/boom'
import { ApplicationVersion } from '../domain/application-version'

const TAGS = ['api', 'version']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'GET',
      path: '/version',
      options: {
        tags: TAGS,
        description: 'return application version',
        response: {
          status: {
            200: Joi.object({
              version: Joi.string().example('0.1.11')
            }),
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (_request, h) => {
        try {
          const version: ApplicationVersion = await container.GetApplicationVersion()
          return h.response({ version: version.version }).code(200)
        } catch (error) {
          throw Boom.internal(error)
        }
      }
    }
  ]
}
