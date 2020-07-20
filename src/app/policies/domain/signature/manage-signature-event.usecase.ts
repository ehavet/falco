import { ManageSignatureEventCommand } from './manage-signature-event-command'
import { SignatureEventValidator } from './signature-event-validator'
import { SignatureEventValidationError } from './signature-event.errors'
import { PolicyRepository } from '../policy.repository'
import { Policy } from '../policy'
import { Logger } from 'pino'

export interface ManageSignatureEvent {
    (manageSignatureEventCommand: ManageSignatureEventCommand): Promise<void>
}

export namespace ManageSignatureEvent {

    // @ts-ignore
    export function factory (signatureEventValidator: SignatureEventValidator, policyRepository: PolicyRepository, logger: Logger): ManageSignatureEvent {
      return async (manageSignatureEventCommand: ManageSignatureEventCommand): Promise<void> => {
        const signatureEvent = manageSignatureEventCommand.event
        if (signatureEventValidator.isValid(signatureEvent)) {
          switch (signatureEvent.event.event_type) {
            case 'signature_request_signed':
              await _manageSignedEvent(signatureEvent, policyRepository)
              return
            default:
              logger.trace('Signature event not managed received')
              return
          }
        }
        throw new SignatureEventValidationError()
      }
    }

    async function _manageSignedEvent (signatureEvent: any, policyRepository: PolicyRepository) {
      const policyId: string = signatureEvent.signature_request.metadata.policyId
      const currentDate: Date = new Date()
      await policyRepository.updateAfterSignature(policyId, currentDate, Policy.Status.Signed)
    }

}
