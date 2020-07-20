import crypto from 'crypto'

import { SignatureEventValidator } from '../../domain/signature/signature-event-validator'
import { HelloSignConfig } from '../../../../configs/hello-sign.config'

export class HelloSignEventValidator implements SignatureEventValidator {
    config: HelloSignConfig

    constructor (config: HelloSignConfig) {
      this.config = config
    }

    isValid (signatureEvent: any): boolean {
      const hash = crypto.createHmac('sha256', this.config.key)
        .update(signatureEvent.event.event_time + signatureEvent.event.event_type)
        .digest('hex').toString()
      return hash === signatureEvent.event.event_hash
    }
}
