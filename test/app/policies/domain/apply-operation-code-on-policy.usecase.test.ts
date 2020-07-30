import { expect, sinon } from '../../../test-utils'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'
import {
  ApplyOperationCodeOnPolicy,
  ApplyOperationCodeOnPolicyCommand
} from '../../../../src/app/policies/domain/apply-operation-code-on-policy.usecase'
import { SinonStubbedInstance, SinonStubbedMember } from 'sinon'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { OperationCodeNotApplicableError } from '../../../../src/app/pricing/domain/operation-code.errors'
import { ComputePriceWithOperationCodeCommand } from '../../../../src/app/pricing/domain/compute-price-with-operation-code-command'
import { ComputePriceWithOperationCode } from '../../../../src/app/pricing/domain/compute-price-with-operation-code.usecase'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { Price } from '../../../../src/app/pricing/domain/price'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'

describe('Policies - Usecase - Apply operation code on policy', async () => {
  const policyRepository: SinonStubbedInstance<PolicyRepository> = policyRepositoryStub()
  const computePriceWithOperationCode : SinonStubbedMember<ComputePriceWithOperationCode> = sinon.stub()

  it('should throw an error if the policy does not exist', async () => {
    // Given
    const policyId = 'APP658473092'
    const applyOperationCodeOnPolicyCommand : ApplyOperationCodeOnPolicyCommand =
            { policyId, operationCode: 'SEMESTER1' }
    const applyOperationCodeOnPolicy = ApplyOperationCodeOnPolicy.factory(policyRepository, computePriceWithOperationCode)
    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))

    // When
    const promise = applyOperationCodeOnPolicy(applyOperationCodeOnPolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })

  it('should throw an error if the operation code does not exist', async () => {
    // Given
    const policyId = 'APP658473092'
    const applyOperationCodeCommand : ApplyOperationCodeOnPolicyCommand =
        { policyId, operationCode: 'SEMESTER1' }
    const applyOperationCodeOnPolicy = ApplyOperationCodeOnPolicy.factory(policyRepository, computePriceWithOperationCode)
    policyRepository.get.withArgs(policyId).resolves()

    const computePriceCommand : ComputePriceWithOperationCodeCommand = { policyId, operationCode: 'SEMESTER1' }
    computePriceWithOperationCode.withArgs(computePriceCommand).rejects(new OperationCodeNotApplicableError('SEMESTER1', 'partner'))

    // When
    const promise = applyOperationCodeOnPolicy(applyOperationCodeCommand)

    // Then
    return expect(promise).to.be.rejectedWith(OperationCodeNotApplicableError)
  })

  it('should update and save the policy with the new price', async () => {
    // Given
    const policyId = 'APP658473092'
    const policy = createPolicyFixture({ id: policyId })
    const applyOperationCodeCommand : ApplyOperationCodeOnPolicyCommand =
        { policyId, operationCode: 'SEMESTER1' }
    const applyOperationCodeOnPolicy = ApplyOperationCodeOnPolicy.factory(policyRepository, computePriceWithOperationCode)
    policyRepository.get.withArgs(policyId).resolves()

    const computePriceCommand : ComputePriceWithOperationCodeCommand = { policyId, operationCode: 'SEMESTER1' }
    const newPrice: Price = { premium: 75.32, nbMonthsDue: 5, monthlyPrice: policy.insurance.estimate.monthlyPrice }
    computePriceWithOperationCode.withArgs(computePriceCommand).resolves(newPrice)

    // When
    const policyUpdated: Policy = await applyOperationCodeOnPolicy(applyOperationCodeCommand)

    // Then
    expect(policyUpdated.premium).to.equal(newPrice.premium)
    expect(policyUpdated.nbMonthsDue).to.equal(newPrice.nbMonthsDue)
  })
})
