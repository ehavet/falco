import { PaymentIntentQuery } from './payment-intent-query'
import { PaymentIntent } from './payment-intent'

export interface CreatePaymentIntent {
    (paymentIntentQuery: PaymentIntentQuery): Promise<PaymentIntent>
}

export namespace CreatePaymentIntent {
    export function factory (): CreatePaymentIntent {
      return async (paymentIntentQuery: PaymentIntentQuery) => {
        // eslint-disable-next-line no-console
        console.log(paymentIntentQuery)
        return { id: 'sdwfsf' }
      }
    }
}
