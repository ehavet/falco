import Joi from 'joi'
import { POSTALCODE_REGEX } from '../../../../common-api/domain/regexp'

const personSchema: Joi.ObjectSchema = Joi.object({
  firstname: Joi.string().allow(null).max(100).description('Firstname').example('John'),
  lastname: Joi.string().allow(null).max(100).description('Lastname').example('Doe')
}).label('QuoteV1.Risk.Person')

export const quoteResponseBodySchema: Joi.ObjectSchema = Joi.object({
  id: Joi.string().required().description('Quote id').example('DU6C73X'),
  code: Joi.string().required().description('Code').example('myCode'),
  risk: Joi.object({
    property: Joi.object({
      room_count: Joi.number().integer().max(5).required().description('Property number of rooms').example(3),
      address: Joi.string().max(100).required().allow(null).description('Property address').example('112 rue du chêne rouge'),
      postal_code: Joi.string().regex(POSTALCODE_REGEX).required().allow(null).description('Property postal code').example('95470'),
      city: Joi.string().max(50).required().allow(null).description('Property city').example('Corbeil-Essonnes'),
      type: Joi.string().required().allow(null).description('The type of property').example('FLAT'),
      occupancy: Joi.string().required().allow(null).description('The occupancy').example('TENANT')
    }).required().description('Risks regarding the property').label('QuoteV1.Risk.Property'),
    person: personSchema.required().allow(null).description('Risks regarding the person'),
    other_people: Joi.array().items(
      personSchema.optional().description('Risks regarding other people')
    ).description('Risks regarding other people').label('QuoteV1.Risk.OtherPeople').example([{ firstname: 'Jane', lastname: 'Dose' }])
  }).required().description('Risks').label('QuoteV1.Risk'),
  insurance: Joi.object({
    monthly_price: Joi.number().precision(2).description('Monthly price').example(5.43),
    default_deductible: Joi.number().precision(2).integer().description('Default deductible').example(150),
    default_cap: Joi.number().precision(2).description('Default cap').example(5000),
    currency: Joi.string().description('Monthly price currency').example('EUR'),
    simplified_covers: Joi.array().items(Joi.string()).description('Simplified covers').label('QuoteV1.Insurance.SimplifiedCovers').example(['ACDDE', 'ACVOL']),
    product_code: Joi.string().description('Product code').example('MRH-Loc-Etud'),
    product_version: Joi.string().description('Date of the product').example('v2020-02-01'),
    contractual_terms: Joi.string().description('Link to the Contractual Terms document').example('http://link/to.ct'),
    ipid: Joi.string().description('Link to the IPID document').example('http://link/to.ipid')
  }).required().description('Insurance').label('QuoteV1.Insurance'),
  policy_holder: Joi.object({
    firstname: Joi.string().allow(null).max(100).description('Policy holder firstname').example('John'),
    lastname: Joi.string().allow(null).max(100).description('Policy holder lastname').example('Doe'),
    address: Joi.string().allow(null).max(100).description('Property address').example('112 rue du chêne rouge'),
    postal_code: Joi.string().allow(null).regex(POSTALCODE_REGEX).description('Property postal code').example('95470'),
    city: Joi.string().allow(null).max(50).description('Property city').example('Corbeil-Essonnes'),
    email: Joi.string().email().allow(null).description('Policy holder email').example('john.doe@email.com'),
    phone_number: Joi.string().max(30).allow(null).description('Policy holder phone number').example('+33684205510'),
    email_validated_at: Joi.date().allow(null).description('Email validation date').example('2020-04-25T10:09:09.000')
  }).optional().allow(null).description('Policy holder contact').label('QuoteV1.PolicyHolder'),
  special_operations_code: Joi.string().allow(null).description('Special operation code applied').example('CODEPROMO1'),
  special_operations_code_applied_at: Joi.date().allow(null).description('Application date of operation special code').example('1957-03-02T10:09:09.000'),
  start_date: Joi.date().allow(null).description('Start date').example('2020-04-26'),
  term_start_date: Joi.date().allow(null).description('Term start date').example('2020-04-26'),
  term_end_date: Joi.date().allow(null).description('Term end date').example('2021-04-25'),
  premium: Joi.number().precision(2).required().description('Premium').example(60.43),
  nb_months_due: Joi.number().integer().min(1).required().max(12).description('Number of months due').example(8)
}).label('QuoteV1')
