import Joi from '@hapi/joi'

export default Joi.object().keys({
  statusCode: Joi.number(),
  error: Joi.string(),
  message: Joi.string()
}).description('Erreur')
  .label('Erreur')
