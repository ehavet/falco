import { Request, ResponseToolkit, Server } from '@hapi/hapi'
import Joi from 'joi'
import { Boom } from '@hapi/boom'
import { happiSwaggerPlugin } from './plugins/swagger'
import { initSequelize } from '../libs/sequelize'
import { partnerRoutes } from '../app/partners/partner.container'
import { emailValidationsRoutes } from '../app/email-validations/email-validations.container'
import { policiesRoutes } from '../app/policies/policies.container'
import { quoteRoutes } from '../app/quotes/quote.container'
import { probesRoutes } from '../app/probes/probes.container'
import { Logger } from '../libs/logger'
import { listenHandlerErrorsEvents } from './event-listeners/on-handler-error.event-listener'
import { listenServerStopEvent } from './event-listeners/on-server-stop.event-listener'

export default async (config: Map<string, any>, logger: Logger): Promise<Server> => {
  const server = new Server({
    port: config.get('FALCO_API_PORT'),
    routes: {
      cors: {
        exposedHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Location', 'Etag']
      },
      validate: {
        failAction: async (_request, _h, err) => {
          if (err) logger.debug(err)
          throw err
        },
        options: {
          abortEarly: false
        }
      }
    }
  })

  server.ext('onPreResponse', setBoomErrorDataToResponse)
  server.validator(Joi)
  server.route(partnerRoutes())
  server.route(emailValidationsRoutes())
  server.route(quoteRoutes())
  server.route(policiesRoutes())
  server.route(probesRoutes())
  await server.register(happiSwaggerPlugin(config))
  const sequelize = await initSequelize(config)

  server.events.on({ name: 'request', tags: true, filter: { tags: ['handler', 'error'], all: true } }, listenHandlerErrorsEvents(logger))
  server.events.on('stop', listenServerStopEvent(sequelize))

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
