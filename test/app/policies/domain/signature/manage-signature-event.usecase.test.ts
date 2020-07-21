import { dateFaker, expect, sinon } from '../../../../test-utils'
import { SignatureEventValidationError } from '../../../../../src/app/policies/domain/signature/signature-event.errors'
import { ManageSignatureEvent } from '../../../../../src/app/policies/domain/signature/manage-signature-event.usecase'
import { ManageSignatureEventCommand } from '../../../../../src/app/policies/domain/signature/manage-signature-event-command'
import { SignatureEventValidator } from '../../../../../src/app/policies/domain/signature/signature-event-validator'
import { SinonStubbedInstance } from 'sinon'
import { signatureEventFixture } from '../../fixtures/signatureEvent.fixture'
import { PolicyRepository } from '../../../../../src/app/policies/domain/policy.repository'
import { Policy } from '../../../../../src/app/policies/domain/policy'

describe('Signature - Usecase - Manage Signature Event', async () => {
  const now = new Date('2020-01-05T10:09:08Z')
  const signatureEventValidator: SinonStubbedInstance<SignatureEventValidator> = { isValid: sinon.stub() }
  const policyRepository: SinonStubbedInstance<PolicyRepository> = { save: sinon.stub(), isIdAvailable: sinon.stub(), get: sinon.mock(), setEmailValidationDate: sinon.mock(), updateAfterPayment: sinon.mock(), updateAfterSignature: sinon.mock() }
  const logger: any = { trace: () => {} }
  const manageSignatureEvent: ManageSignatureEvent = ManageSignatureEvent.factory(signatureEventValidator, policyRepository, logger)
  const eventExample = signatureEventFixture()

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
  })

  it('should throw error if the event is not valid', async () => {
    // Given
    const manageSignatureEventCommand: ManageSignatureEventCommand = { event: eventExample }
    signatureEventValidator.isValid.withArgs(eventExample).returns(false)

    // When
    const promise = manageSignatureEvent(manageSignatureEventCommand)

    // Then
    expect(promise).to.be.rejectedWith(SignatureEventValidationError)
  })

  it('should change policy status if the event is signature_request_signed', async () => {
    // Given
    eventExample.event.event_type = 'signature_request_signed'
    const manageSignatureEventCommand: ManageSignatureEventCommand = { event: eventExample }
    signatureEventValidator.isValid.withArgs(eventExample).returns(true)
    const policyId = eventExample.signature_request.metadata.policyId

    // When
    await manageSignatureEvent(manageSignatureEventCommand)

    // Then
    expect(policyRepository.updateAfterSignature.getCall(0))
      .to.have.been.calledWith(policyId, now, Policy.Status.Signed)
  })
})