import { Envie, Joi } from 'envie'
require('dotenv').config()

export type Config = Map<string, any>

module.exports = Envie({

  FALCO_API_APP_NAME: Joi.string(),

  FALCO_API_DATABASE_URL: Joi.string().uri({ scheme: ['postgres'] }).description('Connection string of the main database'),

  FALCO_API_LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace'),

  FALCO_API_PORT: Joi.number().min(0)
    .description('Port on which the HTTP server will listen'),

  FALCO_API_URL_PREFIX: Joi.string()

}) as Config
