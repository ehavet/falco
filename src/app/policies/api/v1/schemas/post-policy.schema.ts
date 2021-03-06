import Joi from 'joi'
import { Policy } from '../../../domain/policy'

const insuranceSchema: Joi.ObjectSchema = Joi.object({
  monthly_price: Joi.number().precision(2).description('Monthly price').example(5.43),
  default_deductible: Joi.number().precision(2).integer().description('Default deductible').example(150),
  default_cap: Joi.number().precision(2).description('Default cap').example(5000),
  currency: Joi.string().description('Monthly price currency').example('EUR'),
  simplified_covers: Joi.array().items(Joi.string()).description('Simplified covers').example(['ACDDE', 'ACVOL']),
  product_code: Joi.string().allow('').description('Product code').example('MRH-Loc-Etud'),
  product_version: Joi.string().allow('').description('Number of encounters for the day').example('v2020-02-01'),
  contractual_terms: Joi.string().description('Link to the Contractual Terms document').example('http://link/to.ct'),
  ipid: Joi.string().description('Link to the IPID document').example('http://link/to.ipid')
})

const propertyRisksSchema: Joi.ObjectSchema = Joi.object({
  room_count: Joi.number().integer().description('Property number of rooms').example(3),
  address: Joi.string().required().max(100).description('Property address').example('112 rue du chêne rouge'),
  postal_code: Joi.number().integer().positive().required().min(0o1000).max(97680).description('Property postal code').example(95470),
  city: Joi.string().required().max(50).description('Property city').example('Corbeil-Essonnes'),
  type: Joi.string().required().allow(null).description('The type of property').example('FLAT'),
  occupancy: Joi.string().required().allow(null).description('The occupancy of property').example('TENANT')
})

const riskSchema: Joi.ObjectSchema = Joi.object({
  property: propertyRisksSchema.required().description('Risks regarding the property'),
  person: Joi.object({
    firstname: Joi.string().required().max(100).description('Policy holders firstname').example('John'),
    lastname: Joi.string().required().max(100).description('Policy holders lastname').example('Doe')
  }).required().description('Risks regarding the policy holder'),
  other_people: Joi.array().items(
    Joi.object({
      firstname: Joi.string().required().max(100).description('Other insured firstname').example('Jane'),
      lastname: Joi.string().required().max(100).description('Other insured lastname').example('Dose')
    }).optional().description('Risks regarding another insured person')
  ).optional().description('Risks regarding the other insured people').example([{ firstname: 'Jane', lastname: 'Dose' }])
})

const contactSchema: Joi.ObjectSchema = Joi.object({
  address: Joi.string().required().max(100).description('Holder address').example('112 rue du chêne rouge'),
  postal_code: Joi.number().integer().positive().required().min(0o1000).max(97680).description('Holder postal code').example(95470),
  city: Joi.string().required().max(50).description('Holder city').example('Corbeil-Essonnes'),
  firstname: Joi.string().required().max(100).description('Holder firstname').example('John'),
  lastname: Joi.string().required().max(100).description('Holder lastname').example('Doe'),
  email: Joi.string().email().required().description('Holder email').example('john.doe@email.com'),
  phone_number: Joi.string().required().max(30).description('Holder phone number').example('+33684205510'),
  email_validated_at: Joi.date().description('Email validation date').example('2020-04-25T10:09:09.000')
})

export const policySchema: Joi.ObjectSchema = Joi.object({
  id: Joi.string().length(12).description('Policy id').example('APP195329560'),
  code: Joi.string().description('Code').example('myCode'),
  premium: Joi.number().precision(2).description('Premium').example(60.43),
  nb_months_due: Joi.number().integer().min(1).max(12).description('Number of months due').example(8),
  start_date: Joi.date().required().description('Start date').example('2020-04-26'),
  term_start_date: Joi.date().required().description('Term start date').example('2020-04-26'),
  term_end_date: Joi.date().required().description('Term end date').example('2021-04-25'),
  signed_at: Joi.date().optional().allow(null).description('Signature date').example('2020-04-25T10:09:08.000'),
  paid_at: Joi.date().optional().allow(null).description('Payment date').example('2020-04-25T10:09:09.000'),
  subscribed_at: Joi.date().optional().allow(null).description('Subscription date').example('2020-04-25T10:09:08.000'),
  status: Joi.string().valid(...Object.keys(Policy.Status).map(key => Policy.Status[key])).required().description('Policy status').example('INITIATED'),
  risk: riskSchema.required().description('Policy Risks').label('Policy.Risks'),
  insurance: insuranceSchema.required().description('Policy Insurance').label('Policy.Insurance'),
  policy_holder: contactSchema.required().description('Policy Holder').label('Policy.Holder'),
  special_operations_code: Joi.string().required().allow(null).description('Operation special code applied').example('SEMESTER1'),
  special_operations_code_applied_at: Joi.date().required().allow(null).description('Application date of operation special code').example('2020-04-25T10:09:09.000')
}).label('Policy')

export const createPolicyRequestSchema: Joi.ObjectSchema = Joi.object({
  quote_id: Joi.string().required().length(7).description('Quote Id').example('38D7CS0')
}).options({ stripUnknown: true })
