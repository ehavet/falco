import { Envie, Joi } from 'envie'

export type Config = Map<string, any>

module.exports = Envie({

  APP_NAME: Joi.string().default('falco-api'),

  DATABASE_URL: Joi.string().uri({ scheme: ['postgres'] }).default('postgres://test:test@localhost:54334/test')
    .description('Connection string of the main database'),

  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('debug'),

  PORT: Joi.number().min(0).default(8080)
    .description('Port on which the HTTP server will listen'),

  URL_PREFIX: Joi.string().default('/')

}) as Config
