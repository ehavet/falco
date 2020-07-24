import { ManageSignatureEventCommand } from './manage-signature-event-command'
import { SignatureEventValidator } from './signature-event-validator'
import { SignatureEventValidationError } from './signature-event.errors'
import { PolicyRepository } from '../policy.repository'
import { Policy } from '../policy'
import { Logger } from 'pino'
import { SignatureRequester } from '../signature-requester'
import { Contract } from '../contract/contract'
import { ContractRepository } from '../contract/contract.repository'

export interface ManageSignatureEvent {
    (manageSignatureEventCommand: ManageSignatureEventCommand): Promise<void>
}

export namespace ManageSignatureEvent {

    export function factory (signatureEventValidator: SignatureEventValidator, signatureRequester: SignatureRequester, policyRepository: PolicyRepository, contractRepository: ContractRepository, logger: Logger): ManageSignatureEvent {
      return async (manageSignatureEventCommand: ManageSignatureEventCommand): Promise<void> => {
        const signatureEvent = manageSignatureEventCommand.event
        if (signatureEventValidator.isValid(signatureEvent)) {
          switch (signatureEvent.event.event_type) {
            case 'signature_request_signed':
              await _manageSignedEvent(signatureEvent, policyRepository)
              return
            case 'signature_request_downloadable':
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

    async function _manageSignedEvent (signatureEvent: any, policyRepository: PolicyRepository) {
      const policyId: string = signatureEvent.signature_request.metadata.policyId
      const currentDate: Date = new Date()
      await policyRepository.updateAfterSignature(policyId, currentDate, Policy.Status.Signed)
    }

    async function _manageSignedContractDownloadableEvent (signatureEvent: any, signatureRequester: SignatureRequester, contractRepository: ContractRepository) {
      const contract: Contract = await signatureRequester.getSignedContract(signatureEvent.signature_request.signature_request_id, signatureEvent.signature_request.metadata.contractFileName)
      await contractRepository.saveSignedContract(contract)
    }

}
