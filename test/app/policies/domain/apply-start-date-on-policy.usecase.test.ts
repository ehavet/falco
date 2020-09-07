import { SinonStubbedInstance } from 'sinon'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'
import { dateFaker } from '../../../utils/date-faker.test-utils'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { sinon, expect } from '../../../test-utils'
import { PolicyCanceledError, PolicyNotFoundError, PolicyNotUpdatableError, PolicyStartDateConsistencyError } from '../../../../src/app/policies/domain/policies.errors'
import { ApplyStartDateOnPolicy } from '../../../../src/app/policies/domain/apply-start-date-on-policy.usecase'
import { Policy } from '../../../../src/app/policies/domain/policy'

describe('Policies - Usecase - Apply start date on policy', async () => {
  const now: Date = new Date('2021-02-29')
  const policyRepository: SinonStubbedInstance<PolicyRepository> = policyRepositoryStub()
  const applyStartDateOnPolicy: ApplyStartDateOnPolicy = ApplyStartDateOnPolicy.factory(policyRepository)
  const policyId: string = 'APP666699966999'
  const validStartDate: Date = new Date('2021-02-29')

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
  })

  it('should throw an PolicyNotUpdatableError when policy is already signed', async () => {
    // Given
    const policy = createPolicyFixture({ id: policyId, status: Policy.Status.Signed })
    policyRepository.get.withArgs(policyId).resolves(policy)
    // When
    const promise = applyStartDateOnPolicy({ policyId: policyId, startDate: validStartDate })
    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotUpdatableError)
  })

  it('should throw an PolicyCanceledError when policy has been canceled', async () => {
    // Given
    const policy = createPolicyFixture({ id: policyId, status: Policy.Status.Cancelled })
    policyRepository.get.withArgs(policyId).resolves(policy)
    // When
    const promise = applyStartDateOnPolicy({ policyId: policyId, startDate: validStartDate })
    // Then
    expect(promise).to.be.rejectedWith(PolicyCanceledError, `The policy ${policyId} has been canceled`)
  })

  it('should throw an PolicyStartDateConsistencyError when start date is earlier than today', async () => {
    // Given
    const policy = createPolicyFixture({ id: policyId })
    policyRepository.get.withArgs(policyId).resolves(policy)
    const earlierThanTodayDate: Date = new Date('2009-01-27')
    // When
    const promise = applyStartDateOnPolicy({ policyId: policyId, startDate: earlierThanTodayDate })
    // Then
    return expect(promise).to.be.rejectedWith(PolicyStartDateConsistencyError)
  })

  it('should throw an PolicyNotFoundError when policy does not exist', async () => {
    // Given
    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))
    // When
    const promise = applyStartDateOnPolicy({ policyId: policyId, startDate: validStartDate })
    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })

  it('should change start date and update term dates accordingly then return updated policy', async () => {
    // Given
    const retrievedPolicy = createPolicyFixture({ id: policyId })
    const ExpectedUpdatedPolicy = createPolicyFixture({
      id: policyId,
      startDate: new Date('2021-03-01T00:00:00.000Z'),
      termStartDate: new Date('2021-03-01T00:00:00.000Z'),
      termEndDate: new Date('2022-02-28T00:00:00.000Z')
    })

    policyRepository.get.withArgs(policyId).resolves(retrievedPolicy)

    // When
    const response = await applyStartDateOnPolicy({
      policyId: policyId,
      startDate: new Date('2021-02-29')
    })

    // Then
    sinon.assert.calledWithExactly(policyRepository.update, ExpectedUpdatedPolicy)
    expect(response).to.deep.equal(ExpectedUpdatedPolicy)
  })
})
