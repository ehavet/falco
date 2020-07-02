import { Envie, Joi } from 'envie'
require('dotenv').config()

export type Config = Map<string, any>

module.exports = Envie({

  APP_NAME: Joi.string(),

  DATABASE_URL: Joi.string().uri({ scheme: ['postgres'] }).description('Connection string of the main database'),

  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace'),

  PORT: Joi.number().min(0)
    .description('Port on which the HTTP server will listen'),

  URL_PREFIX: Joi.string()

}) as Config
