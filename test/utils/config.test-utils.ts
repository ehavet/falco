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
    .default(''),

  FALCO_API_CRYPTO_KEY: Joi.string().base64().default('D8xUrhp++DiNtwXA1d4MLzYSmW+8HCRk'),

  FALCO_API_CRYPTO_IV: Joi.string(),

  FALCO_API_EMAIL_VALIDATION_URL: Joi.string().uri().default('http://front-url/validate'),

  FALCO_API_EMAIL_VALIDATION_VALIDITY_PERIOD: Joi.number().min(1).default(6),

  FALCO_API_EMAIL_TRANSPORT: Joi.string().valid('sendmail', 'stream'),

  FALCO_API_STRIPE_PRIVATE_KEY: Joi.string().default('sk_test_51GqKYGB099cSJ3oRcsTo6QpE9S6jzlolPcWxeL1Xu8stadcCsdHDK5Wis6MrSw6ApjV0UMZK4u8uJcxIGeNQHOSs00SL7BvJfG')

}) as Config
