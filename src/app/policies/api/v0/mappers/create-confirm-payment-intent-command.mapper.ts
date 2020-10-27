import { ConfirmPaymentIntentCommand } from '../../../domain/confirm-payment-intent-for-policy.usecase'
import { Payment } from '../../../domain/payment/payment'
import { Stripe } from 'stripe'

export function requestToConfirmPaymentIntentCommand (paymentIntent: Stripe.PaymentIntent): ConfirmPaymentIntentCommand {
  return {
    policyId: paymentIntent.metadata.policy_id,
    amount: paymentIntent.amount,
    externalId: paymentIntent.id,
    processor: Payment.Processor.STRIPE,
    instrument: Payment.Instrument.CREDITCARD,
    rawPaymentIntent: paymentIntent
  }
}
