import dayjs from 'dayjs'
import { dateFaker, expect, sinon } from '../../../test-utils'
import { PolicyNotFoundError, PolicyNotUpdatableError } from '../../../../src/app/policies/domain/policies.errors'
import { UpdatePolicy, UpdatePolicyCommand } from '../../../../src/app/policies/domain/update-policy.usecase'
import { SinonStubbedMember } from 'sinon'
import { OperationCodeNotApplicableError } from '../../../../src/app/policies/domain/operation-code.errors'
import { ApplySpecialOperationCodeCommand } from '../../../../src/app/policies/domain/apply-special-operation-code-command'
import { ApplySpecialOperationCodeOnPolicy } from '../../../../src/app/policies/domain/apply-special-operation-code-on-policy.usecase'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'

describe('Policies - Usecase - Update Policy', async () => {
  const now: Date = new Date('2020-07-13')
  const policyRepository = policyRepositoryStub()
  const applySpecialOperationCodeOnPolicy : SinonStubbedMember<ApplySpecialOperationCodeOnPolicy> = sinon.stub()

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
  })

  it('should throw an error if the policy does not exist', async () => {
    // Given
    const policyId = 'APP658473092'
    const updatePolicyCommand : UpdatePolicyCommand =
            { policyId, operationCode: 'SEMESTER1', startDate: new Date('2020-07-13T00:00:00.000Z') }
    const updatePolicy = UpdatePolicy.factory(policyRepository, applySpecialOperationCodeOnPolicy)
    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))

    // When
    const promise = updatePolicy(updatePolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })

  it('should not update the policy if it is already Signed or Payed or Applicable', async () => {
    // Given
    const policyId = 'APP658473092'
    const policy = createPolicyFixture({ id: policyId, status: Policy.Status.Signed })
    const updatePolicyCommand : UpdatePolicyCommand =
        { policyId, operationCode: 'SEMESTER1', startDate: new Date('2020-07-13T00:00:00.000Z') }
    const updatePolicy = UpdatePolicy.factory(policyRepository, applySpecialOperationCodeOnPolicy)
    policyRepository.get.withArgs(policyId).resolves(policy)

    // When
    const promise = updatePolicy(updatePolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotUpdatableError)
  })

  it('should throw an error if the operation code does not exist', async () => {
    // Given
    const policyId = 'APP658473092'
    const updatePolicyCommand : UpdatePolicyCommand =
        { policyId, operationCode: 'SEMESTER1', startDate: new Date('2020-07-13T00:00:00.000Z') }
    const updatePolicy = UpdatePolicy.factory(policyRepository, applySpecialOperationCodeOnPolicy)
    policyRepository.get.withArgs(policyId).resolves(createPolicyFixture())

    const applySpecialOperationCodeCommand : ApplySpecialOperationCodeCommand = { policyId, operationCode: 'SEMESTER1' }
    applySpecialOperationCodeOnPolicy.withArgs(applySpecialOperationCodeCommand).rejects(new OperationCodeNotApplicableError('SEMESTER1', 'partner'))

    // When
    const promise = updatePolicy(updatePolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(OperationCodeNotApplicableError)
  })

  it('should update policy price, start date, term start date and term end date', async () => {
    // Given
    const policyId = 'APP658473092'
    const policy = createPolicyFixture({ id: policyId })
    const startDate = new Date('2020-07-13T00:00:00.000Z')
    const updatePolicyCommand : UpdatePolicyCommand =
        { policyId, operationCode: 'SEMESTER1', startDate }
    const updatePolicy = UpdatePolicy.factory(policyRepository, applySpecialOperationCodeOnPolicy)
    policyRepository.get.withArgs(policyId).resolves(policy)

    const applySpecialOperationCodeCommand : ApplySpecialOperationCodeCommand = { policyId: policyId, operationCode: 'SEMESTER1' }

    const expectedPolicy = createPolicyFixture({ ...policy })
    expectedPolicy.premium = 29.1
    expectedPolicy.nbMonthsDue = 5
    expectedPolicy.termStartDate = startDate
    expectedPolicy.termEndDate = dayjs(startDate).add(5, 'month').toDate()

    applySpecialOperationCodeOnPolicy.withArgs(applySpecialOperationCodeCommand).resolves(expectedPolicy)

    // When
    const response: Policy = await updatePolicy(updatePolicyCommand)

    // Then
    sinon.assert.calledOnceWithExactly(policyRepository.update, expectedPolicy)
    expect(response.premium).to.equal(29.1)
    expect(response.nbMonthsDue).to.equal(5)
    expect(response.startDate).to.deep.equal(startDate)
    expect(response.termStartDate).to.deep.equal(startDate)
    expect(response.termEndDate).to.deep.equal(dayjs(startDate).add(expectedPolicy.nbMonthsDue, 'month').subtract(1, 'day').toDate())
  })

  it('should update policy start date, term start date and term end date', async () => {
    // Given
    const policyId = 'APP658473092'
    const expectedStartDate = new Date('2020-07-13T00:00:00.000Z')
    const twelveMonthsLaterExpectedStartDate = dayjs(expectedStartDate).add(12, 'month').subtract(1, 'day').toDate()
    const initialPolicy = createPolicyFixture({ id: policyId })
    const expectedPolicy = createPolicyFixture({
      id: policyId,
      startDate: expectedStartDate,
      termStartDate: expectedStartDate,
      termEndDate: twelveMonthsLaterExpectedStartDate
    })
    policyRepository.get.withArgs(policyId).resolves(initialPolicy)
    policyRepository.update = sinon.spy()

    // When
    const updatePolicy = UpdatePolicy.factory(policyRepository, applySpecialOperationCodeOnPolicy)
    const command: UpdatePolicyCommand = { policyId, operationCode: undefined, startDate: expectedStartDate }
    const policyUpdated: Policy = await updatePolicy(command)

    // Then
    sinon.assert.calledOnceWithExactly(policyRepository.update, expectedPolicy)
    expect(policyUpdated.startDate).to.deep.equal(expectedPolicy.startDate)
    expect(policyUpdated.termStartDate).to.deep.equal(expectedPolicy.termStartDate)
    expect(policyUpdated.termEndDate).to.deep.equal(expectedPolicy.termEndDate)
  })
})
