import { ManageSignatureEventCommand } from './manage-signature-event-command'
import { SignatureEventValidator } from './signature-event-validator'
import { SignatureEventValidationError } from './signature-event.errors'
import { PolicyRepository } from '../policy.repository'
import { Policy } from '../policy'
import { Logger } from 'pino'
import { SignatureRequester } from '../signature-requester'
import { Contract } from '../contract/contract'
import { ContractRepository } from '../contract/contract.repository'
import SignatureEvent, { SignatureEventType } from './signature-event'

export interface ManageSignatureEvent {
    (manageSignatureEventCommand: ManageSignatureEventCommand): Promise<void>
}

export namespace ManageSignatureEvent {

    export function factory (signatureEventValidator: SignatureEventValidator, signatureRequester: SignatureRequester, policyRepository: PolicyRepository, contractRepository: ContractRepository, logger: Logger): ManageSignatureEvent {
      return async (manageSignatureEventCommand: ManageSignatureEventCommand): Promise<void> => {
        const signatureEvent = manageSignatureEventCommand.event
        if (signatureEventValidator.isValid(signatureEvent)) {
          switch (signatureEvent.type) {
            case SignatureEventType.Signed:
              await _manageSignedEvent(signatureEvent, policyRepository)
              return
            case SignatureEventType.DocumentsDownloadable:
              await _manageSignedContractDownloadableEvent(signatureEvent, signatureRequester, contractRepository)
              return
            default:
              logger.trace('Signature event not managed received')
              return
          }
        }
        throw new SignatureEventValidationError()
      }
    }

    async function _manageSignedEvent (signatureEvent: SignatureEvent, policyRepository: PolicyRepository) {
      const policyId: string = signatureEvent.policyId
      const currentDate: Date = new Date()
      await policyRepository.updateAfterSignature(policyId, currentDate, Policy.Status.Signed)
    }

    async function _manageSignedContractDownloadableEvent (signatureEvent: SignatureEvent, signatureRequester: SignatureRequester, contractRepository: ContractRepository) {
      const contract: Contract = await signatureRequester.getSignedContract(signatureEvent.requestId, signatureEvent.contractFileName)
      await contractRepository.saveSignedContract(contract)
    }

}
