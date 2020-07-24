import { ManageSignatureEventCommand } from './manage-signature-event-command'
import { SignatureEventValidator } from './signature-event-validator'
import { SignatureEventValidationError } from './signature-event.errors'
import { PolicyRepository } from '../policy.repository'
import { Policy } from '../policy'
import { Logger } from 'pino'
import { SignatureServiceProvider } from '../signature-service-provider'
import { Contract } from '../contract/contract'
import { ContractRepository } from '../contract/contract.repository'
import SignatureRequestEvent, { SignatureEventType } from './signature-request-event'

export interface ManageSignatureEvent {
    (manageSignatureEventCommand: ManageSignatureEventCommand): Promise<void>
}

export namespace ManageSignatureEvent {

    export function factory (signatureEventValidator: SignatureEventValidator, signatureServiceProvider: SignatureServiceProvider, policyRepository: PolicyRepository, contractRepository: ContractRepository, logger: Logger): ManageSignatureEvent {
      return async (manageSignatureEventCommand: ManageSignatureEventCommand): Promise<void> => {
        const signatureRequestEvent = manageSignatureEventCommand.event
        if (signatureEventValidator.isValid(signatureRequestEvent)) {
          switch (signatureRequestEvent.type) {
            case SignatureEventType.Signed:
              await _manageSignedEvent(signatureRequestEvent, policyRepository)
              return
            case SignatureEventType.DocumentsDownloadable:
              await _manageSignedContractDownloadableEvent(signatureRequestEvent, signatureServiceProvider, contractRepository)
              return
            default:
              logger.trace('Signature event not managed received')
              return
          }
        }
        throw new SignatureEventValidationError()
      }
    }

    async function _manageSignedEvent (signatureRequestEvent: SignatureRequestEvent, policyRepository: PolicyRepository) {
      const policyId: string = signatureRequestEvent.policyId
      const currentDate: Date = new Date()
      await policyRepository.updateAfterSignature(policyId, currentDate, Policy.Status.Signed)
    }

    async function _manageSignedContractDownloadableEvent (signatureRequestEvent: SignatureRequestEvent, signatureServiceProvider: SignatureServiceProvider, contractRepository: ContractRepository) {
      const contract: Contract = await signatureServiceProvider.getSignedContract(signatureRequestEvent.requestId, signatureRequestEvent.contractFileName)
      await contractRepository.saveSignedContract(contract)
    }

}
