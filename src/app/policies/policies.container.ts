import routes from './api/v0/policies.api'
import { CreatePaymentIntent } from './domain/create-payment.intent'

export interface Container {
    CreatePaymentIntent: CreatePaymentIntent
}

const createPaymentIntent: CreatePaymentIntent = CreatePaymentIntent.factory()

export const container: Container = {
  CreatePaymentIntent: createPaymentIntent
}

export function policiesRoutes () {
  return routes(container)
}
