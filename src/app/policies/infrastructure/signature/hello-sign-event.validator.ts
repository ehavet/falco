import crypto from 'crypto'

import { SignatureEventValidator } from '../../domain/signature/signature-event-validator'
import { HelloSignConfig } from '../../../../configs/hello-sign.config'
import SignatureRequestEvent from '../../domain/signature/signature-request-event'

export class HelloSignEventValidator implements SignatureEventValidator {
    config: HelloSignConfig

    constructor (config: HelloSignConfig) {
      this.config = config
    }

    isValid (signatureRequestEvent: SignatureRequestEvent): boolean {
      const hash = crypto.createHmac('sha256', this.config.key)
        .update(signatureRequestEvent.validation.time + signatureRequestEvent.validation.rawEventType)
        .digest('hex').toString()
      return hash === signatureRequestEvent.validation.hash
    }
}
