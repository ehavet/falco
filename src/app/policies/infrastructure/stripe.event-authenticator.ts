import { logger } from '../../../libs/logger'
import { PaymentEventAuthenticator } from '../domain/payment-event-authenticator'
import { StripeConfig } from '../../../configs/stripe.config'
import { UnauthenticatedEventError } from '../domain/payment-processor.errors'

export class StripeEventAuthenticator implements PaymentEventAuthenticator {
    #config: StripeConfig

    constructor (config: StripeConfig) {
      this.#config = config
    }

    async parse (rawPayload, signature) {
      try {
        return await this.#config.stripe.webhooks
          .constructEvent(
            rawPayload,
            signature,
            this.#config.eventHandlerSecret
          )
      } catch (error) {
        logger.error(error)
        throw new UnauthenticatedEventError(error.message)
      }
    }
}
