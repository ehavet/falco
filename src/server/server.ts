import { Request, ResponseToolkit, Server } from '@hapi/hapi'
import { Boom } from '@hapi/boom'
import { happiSwaggerPlugin } from './plugins/swagger'
import { initSequelize } from '../libs/sequelize'
import { partnerRoutes } from '../app/partners/partner.container'

export default async (config: Map<string, any>): Promise<Server> => {
  const server = new Server({
    port: config.get('PORT'),
    routes: {
      cors: {
        exposedHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Location', 'Etag']
      },
      validate: {
        failAction: async (_request, _h, err) => {
          throw err
        },
        options: {
          abortEarly: false
        }
      }
    }
  })

  server.ext('onPreResponse', setBoomErrorDataToResponse)
  server.validator(require('@hapi/joi'))
  server.route(partnerRoutes())
  await server.register(happiSwaggerPlugin(config))
  await initSequelize(config)

  return server
}

function setBoomErrorDataToResponse (request: Request, h: ResponseToolkit) {
  const response = request.response as Boom
  if (!response.isBoom) {
    return h.continue
  }
  const is4xx = response.output.statusCode >= 400 && response.output.statusCode < 500
  if (is4xx && response.data) {
    // @ts-ignore
    response.output.payload.data = response.data
  }
  return h.continue
}
