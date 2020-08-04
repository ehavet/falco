import { Request, ResponseToolkit, Server } from '@hapi/hapi'
import { Boom } from '@hapi/boom'
import { happiSwaggerPlugin } from './plugins/swagger'
import { initSequelize } from '../libs/sequelize'
import { partnerRoutes } from '../app/partners/partner.container'
import { emailValidationsRoutes } from '../app/email-validations/email-validations.container'
import { policiesRoutes } from '../app/policies/policies.container'
import { quoteRoutes } from '../app/quotes/quote.container'
import { pricingRoutes } from '../app/pricing/pricing.container'

export default async (config: Map<string, any>): Promise<Server> => {
  const server = new Server({
    port: config.get('FALCO_API_PORT'),
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
  server.route(emailValidationsRoutes())
  server.route(quoteRoutes())
  server.route(policiesRoutes())
  server.route(pricingRoutes())
  await server.register(happiSwaggerPlugin(config))
  const sequelize = await initSequelize(config)

  server.events.on('stop', () => {
    sequelize.close()
  })

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
