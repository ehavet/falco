import Joi from '@hapi/joi'

const commonSchema: Joi.ObjectSchema = Joi.object().keys({
  statusCode: Joi.number(),
  error: Joi.string(),
  message: Joi.string(),
  validation: Joi.object()
}).description('Erreur')
  .label('Erreur')

export const badRequestSchema: Joi.ObjectSchema = commonSchema.description('Bad Request')
  .label('BadRequest')

export const notFoundSchema: Joi.ObjectSchema = commonSchema.description('Not Found')
  .label('NotFound')

export const unprocessableEntitySchema: Joi.ObjectSchema = commonSchema.description('Unprocessable Entity')
  .label('UnprocessableEntity')

export const internalServerErrorSchema: Joi.ObjectSchema = commonSchema.description('Internal Server Error')
  .label('InternalServerError')
