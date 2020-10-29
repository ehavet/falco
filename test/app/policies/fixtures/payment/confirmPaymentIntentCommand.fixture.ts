import { Payment } from '../../../../../src/app/policies/domain/payment/payment'
import { getStripePaymentIntentSucceededEvent } from './stripeEvent.fixture'
import { ConfirmPaymentIntentCommand } from '../../../../../src/app/policies/domain/confirm-payment-intent-for-policy.usecase'

export function createConfirmPaymentIntentCommandFixture (attr = {}): ConfirmPaymentIntentCommand {
  return {
    policyId: 'APP347564310',
    amount: 100000,
    externalId: 'pi_1DgjcP2eZvKYlo2CcMcqZ3qi',
    processor: Payment.Processor.STRIPE,
    method: Payment.Method.CREDITCARD,
    rawPaymentIntent: getStripePaymentIntentSucceededEvent().data.object,
    ...attr
  }
}
