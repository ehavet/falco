import { Container } from '../../health-checks.container'
import { ServerRoute } from '@hapi/hapi'
import Joi from '@hapi/joi'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import * as Boom from '@hapi/boom'
import { DatabaseInitializationError } from '../../../common-api/domain/database.errors'

const TAGS = ['api', 'health-checks']

export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'GET',
      path: '/internal/v0/health-checks/readiness',
      options: {
        tags: TAGS,
        description: 'return application readiness status',
        response: {
          status: {
            200: Joi.object({
              state: Joi.string().valid('UP', 'DOWN').example('UP')
            }),
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (_request, h) => {
        try {
          const readinessStatus = await container.CheckApplicationReadiness() ? 'UP' : 'DOWN'
          return h.response({ state: readinessStatus }).code(200)
        } catch (error) {
          if (error instanceof DatabaseInitializationError) {
            return h.response({ state: 'DOWN' }).code(200)
          }
          throw Boom.internal(error)
        }
      }
    }
  ]
}
