import routes from './api/v0/policies.api'
import { CreatePaymentIntent } from './domain/create-payment.intent'
import { PolicySqlModel } from './infrastructure/policy-sql.model'
import { ContactSqlModel } from './infrastructure/contact-sql.model'
import { CreatePolicy } from './domain/create-policy.usecase'
import { PolicyRepository } from './domain/policy.repository'
import { PolicySqlRepository } from './infrastructure/policy-sql.repository'
import { container as quoteContainer } from '../quotes/quote.container'
import { QuoteRepository } from '../quotes/domain/quote.repository'

export interface Container {
    CreatePaymentIntent: CreatePaymentIntent,
    CreatePolicy: CreatePolicy
}

const policyRepository: PolicyRepository = new PolicySqlRepository()
const quoteRepository: QuoteRepository = quoteContainer.quoteRepository
const createPolicy: CreatePolicy = CreatePolicy.factory(policyRepository, quoteRepository)

const createPaymentIntent: CreatePaymentIntent = CreatePaymentIntent.factory()

export const container: Container = {
  CreatePaymentIntent: createPaymentIntent,
  CreatePolicy: createPolicy
}

export const policySqlModels: Array<any> = [PolicySqlModel, ContactSqlModel]

export function policiesRoutes () {
  return routes(container)
}
