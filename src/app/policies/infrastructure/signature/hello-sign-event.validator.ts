import crypto from 'crypto'

import { SignatureEventValidator } from '../../domain/signature/signature-event-validator'
import { HelloSignConfig } from '../../../../configs/hello-sign.config'
import SignatureEvent from '../../domain/signature/signature-event'

export class HelloSignEventValidator implements SignatureEventValidator {
    config: HelloSignConfig

    constructor (config: HelloSignConfig) {
      this.config = config
    }

    isValid (signatureEvent: SignatureEvent): boolean {
      const hash = crypto.createHmac('sha256', this.config.key)
        .update(signatureEvent.time + signatureEvent.type)
        .digest('hex').toString()
      return hash === signatureEvent.hash
    }
}
