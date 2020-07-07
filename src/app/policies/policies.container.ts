import routes from './api/v0/policies.api'
import { CreatePaymentIntent } from './domain/create-payment.intent'
import { PolicySqlModel } from './infrastructure/policy-sql.model'
import { ContactSqlModel } from './infrastructure/contact-sql.model'

export interface Container {
    CreatePaymentIntent: CreatePaymentIntent
}

const createPaymentIntent: CreatePaymentIntent = CreatePaymentIntent.factory()

export const container: Container = {
  CreatePaymentIntent: createPaymentIntent
}

export const policySqlModels: Array<any> = [PolicySqlModel, ContactSqlModel]

export function policiesRoutes () {
  return routes(container)
}
