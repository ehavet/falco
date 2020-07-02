import { Envie, Joi } from 'envie'

export type Config = Map<string, any>

module.exports = Envie({
  FALCO_API_LOG_LEVEL: Joi
    .string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('error'),

  FALCO_API_PORT: Joi
    .number()
    .min(0)
    .default(8666)
    .description('Port on which the HTTP server will listen'),

  FALCO_API_DATABASE_URL: Joi
    .string()
    .uri({ scheme: ['postgres'] })
    .default('postgres://test:test@localhost:54334/test')
    .description('Connection string of the main database'),

  FALCO_API_URL_PREFIX: Joi
    .string()
    .default('/'),

  FALCO_API_DEBUG: Joi
    .string()
    .default('')

}) as Config
