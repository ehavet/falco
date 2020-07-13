import { SinonStubbedInstance } from 'sinon'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { dateFaker, expect, sinon } from '../../../test-utils'
import { createOngoingPolicyFixture } from '../fixtures/policy.fixture'
import { ConfirmPaymentIntentForPolicy } from '../../../../src/app/policies/domain/confirm-payment-intent-for-policy.usecase'
import { Policy } from '../../../../src/app/policies/domain/policy'

describe('PaymentProcessor - Usecase - confirm payment intent for policy', async () => {
  const now = new Date('2020-01-05T10:09:08Z')
  const policyRepository: SinonStubbedInstance<PolicyRepository> = {
    save: sinon.stub(),
    isIdAvailable: sinon.stub(),
    get: sinon.stub(),
    setEmailValidationDate: sinon.stub(),
    updateAfterPayment: sinon.stub()
  }

  const confirmPaymentIntentForPolicy: ConfirmPaymentIntentForPolicy = ConfirmPaymentIntentForPolicy.factory(policyRepository)

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
  })

  it('should update policy when payment intent is confirmed', async () => {
    // Given
    const policyId = 'p0l1cy1D'
    const expectedPolicy = createOngoingPolicyFixture({ id: policyId })
    policyRepository.save.resolves(expectedPolicy)

    // When
    await confirmPaymentIntentForPolicy(policyId)

    // Then
    expect(policyRepository.updateAfterPayment.getCall(0))
      .to.have.been.calledWith(policyId, now, now, Policy.Status.Applicable)
  })
})
