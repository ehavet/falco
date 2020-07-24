import { dateFaker, expect, sinon } from '../../../../test-utils'
import { SignatureEventValidationError } from '../../../../../src/app/policies/domain/signature/signature-event.errors'
import { ManageSignatureEvent } from '../../../../../src/app/policies/domain/signature/manage-signature-event.usecase'
import { ManageSignatureEventCommand } from '../../../../../src/app/policies/domain/signature/manage-signature-event-command'
import { SignatureEventValidator } from '../../../../../src/app/policies/domain/signature/signature-event-validator'
import { SinonStubbedInstance } from 'sinon'
import { signatureEventFixture } from '../../fixtures/signatureEvent.fixture'
import { PolicyRepository } from '../../../../../src/app/policies/domain/policy.repository'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { Contract } from '../../../../../src/app/policies/domain/contract/contract'
import { ContractRepository } from '../../../../../src/app/policies/domain/contract/contract.repository'
import { SignatureServiceProvider } from '../../../../../src/app/policies/domain/signature-service-provider'
import { SignatureEventType } from '../../../../../src/app/policies/domain/signature/signature-event'

describe('Signature - Usecase - Manage Signature Event', async () => {
  const now = new Date('2020-01-05T10:09:08Z')
  const signatureEventValidator: SinonStubbedInstance<SignatureEventValidator> = { isValid: sinon.stub() }
  const policyRepository: SinonStubbedInstance<PolicyRepository> = { save: sinon.stub(), isIdAvailable: sinon.stub(), get: sinon.mock(), setEmailValidationDate: sinon.mock(), updateAfterPayment: sinon.mock(), updateAfterSignature: sinon.mock() }
  const contractRepository: SinonStubbedInstance<ContractRepository> = { saveTempContract: sinon.stub(), saveSignedContract: sinon.mock() }
  const signatureProvider: SinonStubbedInstance<SignatureServiceProvider> = { create: sinon.stub(), getSignedContract: sinon.mock() }
  const logger: any = { trace: () => {} }
  const manageSignatureEvent: ManageSignatureEvent = ManageSignatureEvent.factory(signatureEventValidator, signatureProvider, policyRepository, contractRepository, logger)
  const eventExample = signatureEventFixture()

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
  })

  describe('when the event is not valid', async () => {
    it('should throw error', async () => {
      // Given
      const manageSignatureEventCommand: ManageSignatureEventCommand = { event: eventExample }
      signatureEventValidator.isValid.withArgs(eventExample).returns(false)

      // When
      const promise = manageSignatureEvent(manageSignatureEventCommand)

      // Then
      expect(promise).to.be.rejectedWith(SignatureEventValidationError)
    })
  })

  describe('when the signature is signed', async () => {
    it('should change policy status to Signed', async () => {
      // Given
      eventExample.type = SignatureEventType.Signed
      const manageSignatureEventCommand: ManageSignatureEventCommand = { event: eventExample }
      signatureEventValidator.isValid.withArgs(eventExample).returns(true)
      const policyId = eventExample.policyId

      // When
      await manageSignatureEvent(manageSignatureEventCommand)

      // Then
      expect(policyRepository.updateAfterSignature.getCall(0))
        .to.have.been.calledWith(policyId, now, Policy.Status.Signed)
    })
  })

  describe('when the signed contract is ready to be downloaded', async () => {
    it('should retrieve and save the signed contract', async () => {
      // Given
      eventExample.type = SignatureEventType.DocumentsDownloadable
      eventExample.contractFileName = 'Appenin_Contrat_assurance_habitation_APP645372888'
      const manageSignatureEventCommand: ManageSignatureEventCommand = { event: eventExample }
      const signedContract: Contract = { name: 'contract', buffer: Buffer.from('contract') }

      signatureEventValidator.isValid.withArgs(eventExample).returns(true)
      signatureProvider.getSignedContract.withArgs(eventExample.requestId, 'Appenin_Contrat_assurance_habitation_APP645372888').resolves(signedContract)
      contractRepository.saveSignedContract.withArgs(signedContract).resolves(signedContract)

      // When
      await manageSignatureEvent(manageSignatureEventCommand)

      // Then
      expect(contractRepository.saveSignedContract.getCall(0))
        .to.have.been.calledWith(signedContract)
    })
  })
})
