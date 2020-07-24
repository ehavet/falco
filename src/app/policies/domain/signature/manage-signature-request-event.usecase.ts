import { ManageSignatureRequestEventCommand } from './manage-signature-request-event-command'
import { SignatureRequestEventValidator } from './signature-request-event-validator'
import { SignatureRequestEventValidationError } from './signature-request-event.errors'
import { PolicyRepository } from '../policy.repository'
import { Policy } from '../policy'
import { Logger } from 'pino'
import { SignatureServiceProvider } from '../signature-service-provider'
import { Contract } from '../contract/contract'
import { ContractRepository } from '../contract/contract.repository'
import SignatureRequestEvent, { SignatureRequestEventType } from './signature-request-event'

export interface ManageSignatureRequestEvent {
    (manageSignatureRequestEventCommand: ManageSignatureRequestEventCommand): Promise<void>
}

export namespace ManageSignatureRequestEvent {

    export function factory (signatureRequestEventValidator: SignatureRequestEventValidator, signatureServiceProvider: SignatureServiceProvider, policyRepository: PolicyRepository, contractRepository: ContractRepository, logger: Logger): ManageSignatureRequestEvent {
      return async (manageSignatureRequestEventCommand: ManageSignatureRequestEventCommand): Promise<void> => {
        const signatureRequestEvent = manageSignatureRequestEventCommand.event
        if (signatureRequestEventValidator.isValid(signatureRequestEvent)) {
          switch (signatureRequestEvent.type) {
            case SignatureRequestEventType.Signed:
              await _manageSignedEvent(signatureRequestEvent, policyRepository)
              break
            case SignatureRequestEventType.DocumentsDownloadable:
              await _manageSignedContractDownloadableEvent(signatureRequestEvent, signatureServiceProvider, contractRepository)
              break
            default:
              logger.trace('Signature event not managed received')
          }
          return Promise.resolve()
        }
        throw new SignatureRequestEventValidationError()
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
