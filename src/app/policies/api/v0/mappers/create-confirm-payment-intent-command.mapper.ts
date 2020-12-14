import { ConfirmPaymentIntentCommand } from '../../../domain/confirm-payment-intent-for-policy.usecase'
import { Payment } from '../../../domain/payment/payment'
import { Stripe } from 'stripe'
import { Amount } from '../../../../common-api/domain/amount/amount'
export function requestToConfirmPaymentIntentCommand (paymentIntent: Stripe.PaymentIntent): ConfirmPaymentIntentCommand {
  return {
    policyId: paymentIntent.metadata.policy_id,
    amount: Amount.toAmount(paymentIntent.amount),
    externalId: paymentIntent.id,
    processor: Payment.Processor.STRIPE,
    method: Payment.Method.CREDITCARD,
    rawPaymentIntent: paymentIntent
  }
}
