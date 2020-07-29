import { expect, sinon } from '../../../test-utils'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'
import {
  ApplyOperationCodeOnPolicy,
  ApplyOperationCodeOnPolicyCommand
} from '../../../../src/app/policies/domain/apply-operation-code-on-policy.usecase'
import { SinonStubbedInstance } from 'sinon'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'

describe('Policies - Usecase - Apply operation code on policy', async () => {
  const policyRepository: SinonStubbedInstance<PolicyRepository> = {
    get: sinon.stub(),
    save: sinon.stub(),
    isIdAvailable: sinon.stub(),
    setEmailValidationDate: sinon.stub(),
    updateAfterPayment: sinon.stub(),
    updateAfterSignature: sinon.stub()
  }

  it('should throw an error if the policy does not exist', async () => {
    // Given
    const policyId = 'APP658473092'
    const applyOperationCodeOnPolicyCommand : ApplyOperationCodeOnPolicyCommand =
            { policyId, operationCode: 'SEMESTER1' }
    const applyOperationCodeOnPolicy = ApplyOperationCodeOnPolicy.factory(policyRepository)
    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))

    // When
    const promise = applyOperationCodeOnPolicy(applyOperationCodeOnPolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })
})
