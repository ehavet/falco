import { logger } from '../../../libs/logger'
import { PaymentEventAuthenticator } from '../domain/payment-event-authenticator'
import { StripeConfig } from '../../../configs/stripe.config'
import { UnauthenticatedEventError } from '../domain/payment-processor.errors'
import { isRelatedToADemoPartner } from '../../partners/domain/partner.func'

export class StripeEventAuthenticator implements PaymentEventAuthenticator {
    #config: StripeConfig

    constructor (config: StripeConfig) {
      this.#config = config
    }

    async parse (rawPayload, signature) {
      try {
        const parsedPayload = JSON.parse(rawPayload)
        // eslint-disable-next-line camelcase
        const isDemoStudent = isRelatedToADemoPartner(parsedPayload.data?.object?.metadata?.partner_code)
        if (isDemoStudent) {
          return await this.#config.stripe.TestClient.webhooks
            .constructEvent(
              rawPayload,
              signature,
              this.#config.eventHandlerSecret
            )
        } else {
          return await this.#config.stripe.LiveClient.webhooks
            .constructEvent(
              rawPayload,
              signature,
              this.#config.eventHandlerSecret
            )
        }
      } catch (error) {
        logger.error(error)
        throw new UnauthenticatedEventError(error.message)
      }
    }
}
