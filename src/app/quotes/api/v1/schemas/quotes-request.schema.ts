import Joi from 'joi'
import { POSTALCODE_REGEX } from '../../../../common-api/domain/regexp'

const riskPropertySchema: Joi.ObjectSchema = Joi.object({
  room_count: Joi.number().integer().max(5).required().description('Property number of rooms').example(3),
  address: Joi.string().max(100).required().description('Property address').example('112 rue du chêne rouge'),
  postal_code: Joi.string().regex(POSTALCODE_REGEX).required().description('Property postal code').example('95470'),
  city: Joi.string().max(50).required().description('Property city').example('Corbeil-Essonnes'),
  type: Joi.string().equal('FLAT', 'HOUSE').uppercase().required().description('The type of property').example('FLAT'),
  occupancy: Joi.string().equal('TENANT', 'LANDLORD').uppercase().required().description('The occupancy of the property').example('TENANT')
}).description('Risks regarding the property').label('QuoteV1.Risk.Property')

const riskPersonSchema: Joi.ObjectSchema = Joi.object({
  firstname: Joi.string().required().max(100).description('Person firstname').example('John'),
  lastname: Joi.string().required().max(100).description('Person lastname').example('Doe')
}).description('Risks regarding the person').label('QuoteV1.Risk.Person')

const riskOtherPeopleSchema: Joi.ArraySchema = Joi.array().items(
  riskPersonSchema.optional().description('Risks regarding other people')
).description('Risks regarding the other people').example([{ firstname: 'Jane', lastname: 'Dose' }]).label('QuoteV1.Risk.OtherPeople')

const quoteRiskSchema: Joi.ObjectSchema = Joi.object({
  property: riskPropertySchema.required(),
  person: riskPersonSchema.optional().allow(null),
  other_people: riskOtherPeopleSchema.optional().allow(null)
}).required().description('Risks').label('QuoteV1.Risk')

const policyHolderSchema: Joi.ObjectSchema = Joi.object({
  firstname: Joi.string().optional().allow(null).max(100).description('Policy holder firstname').example('John'),
  lastname: Joi.string().optional().allow(null).max(100).description('Policy holder lastname').example('Dong'),
  email: Joi.string().email().optional().allow(null).description('Policy holder email').example('john.dong@email.com'),
  phone_number: Joi.string().optional().allow(null).max(30).description('Policy holder phone number').example('+33684205510'),
  address: Joi.string().optional().allow(null).max(100).description('Policy holder address').example('112 rue du chêne rouge'),
  postal_code: Joi.string().optional().regex(POSTALCODE_REGEX).allow(null).description('Policy holder postal code').example('95470'),
  city: Joi.string().optional().allow(null).max(50).description('Policy holder city').example('Corbeil-Essonnes')
}).description('Policy holder').label('QuoteV1.PolicyHolder')

export const quotePostRequestBodySchema: Joi.ObjectSchema = Joi.object({
  code: Joi.string().required().description('Partner code').example('myCode'),
  start_date: Joi.date().optional().allow(null).description('Start date').example('2020-04-26'),
  spec_ops_code: Joi.string().trim().max(30).optional().allow(null).description('Special operation code').example('SPECIALCODE1'),
  risk: quoteRiskSchema,
  policy_holder: policyHolderSchema.optional().allow(null)
}).options({ stripUnknown: true })

export const quotePutRequestBodySchema: Joi.ObjectSchema = Joi.object({
  start_date: Joi.date().optional().allow(null).description('Start date').example('2020-04-26'),
  spec_ops_code: Joi.string().trim().max(30).optional().allow(null).description('Special operation code').example('SPECIALCODE1'),
  risk: quoteRiskSchema,
  policy_holder: policyHolderSchema.optional().allow(null)
}).options({ stripUnknown: true })
