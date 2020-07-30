import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { expect } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { GetPolicy } from '../../../../src/app/policies/domain/get-policy.usecase'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'
import { GetPolicyQuery } from '../../../../src/app/policies/domain/get-policy-query'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'

describe('Policies - Usecase - Get policy', async () => {
  const policyRepository: SinonStubbedInstance<PolicyRepository> = policyRepositoryStub()

  const getPolicy: GetPolicy = GetPolicy.factory(policyRepository)

  it('should return the found policy', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const policyFromDb: Policy = createPolicyFixture({ id: policyId })
    const getPolicyQuery: GetPolicyQuery = { policyId }
    policyRepository.get.withArgs(policyId).resolves(policyFromDb)

    // When
    const foundPolicy: Policy = await getPolicy(getPolicyQuery)

    // Then
    expect(foundPolicy).to.deep.equal(policyFromDb)
  })

  it('should throw error if policy is not found', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const getPolicyQuery: GetPolicyQuery = { policyId }
    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))

    // When
    const promise = getPolicy(getPolicyQuery)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })
})
