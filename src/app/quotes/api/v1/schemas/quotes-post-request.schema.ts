import Joi from 'joi'
import { POSTALCODE_REGEX } from '../../../../common-api/domain/regexp'

export const quotePostRequestBodySchema: Joi.ObjectSchema = Joi.object({
  code: Joi.string().required().description('Partner code').example('myCode'),
  start_date: Joi.date().optional().description('Start date').example('2020-04-26'),
  spec_ops_code: Joi.string().trim().optional().max(30).description('Special operation code').example('SPECIALCODE1'),
  risk: Joi.object({
    property: Joi.object({
      room_count: Joi.number().integer().max(5).required().description('Property number of rooms').example(3),
      address: Joi.string().max(100).required().description('Property address').example('112 rue du chêne rouge'),
      postal_code: Joi.string().regex(POSTALCODE_REGEX).required().description('Property postal code').example('95470'),
      city: Joi.string().max(50).required().description('Property city').example('Corbeil-Essonnes'),
      type: Joi.string().required().equal('FLAT', 'HOUSE').uppercase().description('The type of property').example('FLAT'),
      occupancy: Joi.string().required().equal('TENANT', 'LANDLORD').uppercase().description('The occupancy of the property').example('TENANT')
    }).required().description('Risks regarding the property'),
    person: Joi.object({
      firstname: Joi.string().required().max(100).description('Person firstname').example('John'),
      lastname: Joi.string().required().max(100).description('Person lastname').example('Doe')
    }).optional().description('Risks regarding the person'),
    other_people: Joi.array().items(
      Joi.object({
        firstname: Joi.string().required().max(100).description('Other person').example('Jane'),
        lastname: Joi.string().required().max(100).description('Other person').example('Dose')
      }).optional().description('Risks regarding other people')
    ).optional().description('Risks regarding the other people').example([{ firstname: 'Jane', lastname: 'Dose' }])
  }).required().description('Risks').label('Risk'),
  policy_holder: Joi.object({
    firstname: Joi.string().required().allow(null).max(100).description('Policy holder firstname').example('John'),
    lastname: Joi.string().required().allow(null).max(100).description('Policy holder lastname').example('Dong'),
    email: Joi.string().email().required().allow(null).description('Policy holder email').example('john.dong@email.com'),
    phone_number: Joi.string().required().allow(null).max(30).description('Policy holder phone number').example('+33684205510'),
    address: Joi.string().required().allow(null).max(100).description('Policy holder address').example('112 rue du chêne rouge'),
    postal_code: Joi.string().required().regex(POSTALCODE_REGEX).allow(null).description('Policy holder postal code').example('95470'),
    city: Joi.string().required().allow(null).max(50).description('Policy holder city').example('Corbeil-Essonnes')
  }).optional().description('Policy holder contact')
}).options({ stripUnknown: true })
