import routes from './api/v0/policies.api'
import { CreatePaymentIntentForPolicy } from './domain/create-payment-intent-for-policy.usecase'
import { PolicySqlModel } from './infrastructure/policy-sql.model'
import { ContactSqlModel } from './infrastructure/contact-sql.model'
import { StripePaymentProcessor } from './infrastructure/stripe.payment-processor'
import { stripe } from '../../libs/stripe'
import { PolicyRepository } from './domain/policy.repository'
import { CreatePolicy } from './domain/create-policy.usecase'
import { PolicySqlRepository } from './infrastructure/policy-sql.repository'
import { container as quoteContainer } from '../quotes/quote.container'
import { QuoteRepository } from '../quotes/domain/quote.repository'

export interface Container {
    CreatePaymentIntentForPolicy: CreatePaymentIntentForPolicy
    CreatePolicy: CreatePolicy
}

const policyRepository: PolicyRepository = new PolicySqlRepository()
const quoteRepository: QuoteRepository = quoteContainer.quoteRepository
const paymentProcessor: StripePaymentProcessor = new StripePaymentProcessor(stripe)

const createPolicy: CreatePolicy = CreatePolicy.factory(policyRepository, quoteRepository)
const createPaymentIntentForPolicy: CreatePaymentIntentForPolicy =
    CreatePaymentIntentForPolicy.factory(paymentProcessor, policyRepository)

export const container: Container = {
  CreatePaymentIntentForPolicy: createPaymentIntentForPolicy,
  CreatePolicy: createPolicy
}

export const policySqlModels: Array<any> = [PolicySqlModel, ContactSqlModel]

export function policiesRoutes () {
  return routes(container)
}
