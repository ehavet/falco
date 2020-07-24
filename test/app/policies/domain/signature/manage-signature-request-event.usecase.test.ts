import { dateFaker, expect, sinon } from '../../../../test-utils'
import { SignatureRequestEventValidationError } from '../../../../../src/app/policies/domain/signature/signature-request-event.errors'
import { ManageSignatureRequestEvent } from '../../../../../src/app/policies/domain/signature/manage-signature-request-event.usecase'
import { ManageSignatureRequestEventCommand } from '../../../../../src/app/policies/domain/signature/manage-signature-request-event-command'
import { SignatureRequestEventValidator } from '../../../../../src/app/policies/domain/signature/signature-request-event-validator'
import { SinonStubbedInstance } from 'sinon'
import { signatureRequestEventFixture } from '../../fixtures/signatureRequestEvent.fixture'
import { PolicyRepository } from '../../../../../src/app/policies/domain/policy.repository'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { Contract } from '../../../../../src/app/policies/domain/contract/contract'
import { ContractRepository } from '../../../../../src/app/policies/domain/contract/contract.repository'
import { SignatureServiceProvider } from '../../../../../src/app/policies/domain/signature-service-provider'
import { SignatureRequestEventType } from '../../../../../src/app/policies/domain/signature/signature-request-event'

describe('Signature - Usecase - Manage Signature Request Event', async () => {
  const now = new Date('2020-01-05T10:09:08Z')
  const signatureRequestEventValidator: SinonStubbedInstance<SignatureRequestEventValidator> = { isValid: sinon.stub() }
  const policyRepository: SinonStubbedInstance<PolicyRepository> = { save: sinon.stub(), isIdAvailable: sinon.stub(), get: sinon.mock(), setEmailValidationDate: sinon.mock(), updateAfterPayment: sinon.mock(), updateAfterSignature: sinon.mock() }
  const contractRepository: SinonStubbedInstance<ContractRepository> = { saveTempContract: sinon.stub(), saveSignedContract: sinon.mock() }
  const signatureProvider: SinonStubbedInstance<SignatureServiceProvider> = { create: sinon.stub(), getSignedContract: sinon.mock() }
  const logger: any = { trace: () => {} }
  const manageSignatureRequestEvent: ManageSignatureRequestEvent = ManageSignatureRequestEvent.factory(signatureRequestEventValidator, signatureProvider, policyRepository, contractRepository, logger)
  const eventExample = signatureRequestEventFixture()

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
  })

  describe('when the event is not valid', async () => {
    it('should throw error', async () => {
      // Given
      const manageSignatureRequestEventCommand: ManageSignatureRequestEventCommand = { event: eventExample }
      signatureRequestEventValidator.isValid.withArgs(eventExample).returns(false)

      // When
      const promise = manageSignatureRequestEvent(manageSignatureRequestEventCommand)

      // Then
      expect(promise).to.be.rejectedWith(SignatureRequestEventValidationError)
    })
  })

  describe('when the signature request is signed', async () => {
    it('should change policy status to Signed', async () => {
      // Given
      eventExample.type = SignatureRequestEventType.Signed
      const manageSignatureRequestEventCommand: ManageSignatureRequestEventCommand = { event: eventExample }
      signatureRequestEventValidator.isValid.withArgs(eventExample).returns(true)
      const policyId = eventExample.policyId

      // When
      await manageSignatureRequestEvent(manageSignatureRequestEventCommand)

      // Then
      expect(policyRepository.updateAfterSignature.getCall(0))
        .to.have.been.calledWith(policyId, now, Policy.Status.Signed)
    })
  })

  describe('when the signed contract is ready to be downloaded', async () => {
    it('should retrieve and save the signed contract', async () => {
      // Given
      eventExample.type = SignatureRequestEventType.DocumentsDownloadable
      eventExample.contractFileName = 'Appenin_Contrat_assurance_habitation_APP645372888'
      const manageSignatureRequestEventCommand: ManageSignatureRequestEventCommand = { event: eventExample }
      const signedContract: Contract = { name: 'contract', buffer: Buffer.from('contract') }

      signatureRequestEventValidator.isValid.withArgs(eventExample).returns(true)
      signatureProvider.getSignedContract.withArgs(eventExample.requestId, 'Appenin_Contrat_assurance_habitation_APP645372888').resolves(signedContract)
      contractRepository.saveSignedContract.withArgs(signedContract).resolves(signedContract)

      // When
      await manageSignatureRequestEvent(manageSignatureRequestEventCommand)

      // Then
      expect(contractRepository.saveSignedContract.getCall(0))
        .to.have.been.calledWith(signedContract)
    })
  })
})
