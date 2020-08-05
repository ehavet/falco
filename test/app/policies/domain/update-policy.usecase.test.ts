import dayjs from 'dayjs'
import { expect, sinon } from '../../../test-utils'
import { PolicyNotFoundError, PolicyNotUpdatable } from '../../../../src/app/policies/domain/policies.errors'
import { UpdatePolicy, UpdatePolicyCommand } from '../../../../src/app/policies/domain/update-policy.usecase'
import { SinonStubbedMember } from 'sinon'
import { OperationCodeNotApplicableError } from '../../../../src/app/pricing/domain/operation-code.errors'
import { ComputePriceWithOperationCodeCommand } from '../../../../src/app/pricing/domain/compute-price-with-operation-code-command'
import { ComputePriceWithOperationCode } from '../../../../src/app/pricing/domain/compute-price-with-operation-code.usecase'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { Price } from '../../../../src/app/pricing/domain/price'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'

describe('Policies - Usecase - Update Policy', async () => {
  const policyRepository = policyRepositoryStub()
  const computePriceWithOperationCode : SinonStubbedMember<ComputePriceWithOperationCode> = sinon.stub()

  it('should throw an error if the policy does not exist', async () => {
    // Given
    const policyId = 'APP658473092'
    const updatePolicyCommand : UpdatePolicyCommand =
            { policyId, operationCode: 'SEMESTER1', startDate: new Date('2020-02-12T00:00:00.000Z') }
    const updatePolicy = UpdatePolicy.factory(policyRepository, computePriceWithOperationCode)
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
        { policyId, operationCode: 'SEMESTER1', startDate: new Date('2020-02-12T00:00:00.000Z') }
    const updatePolicy = UpdatePolicy.factory(policyRepository, computePriceWithOperationCode)
    policyRepository.get.withArgs(policyId).resolves(policy)

    // When
    const promise = updatePolicy(updatePolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotUpdatable)
  })

  it('should throw an error if the operation code does not exist', async () => {
    // Given
    const policyId = 'APP658473092'
    const updatePolicyCommand : UpdatePolicyCommand =
        { policyId, operationCode: 'SEMESTER1', startDate: new Date('2020-02-12T00:00:00.000Z') }
    const updatePolicy = UpdatePolicy.factory(policyRepository, computePriceWithOperationCode)
    policyRepository.get.withArgs(policyId).resolves(createPolicyFixture())

    const computePriceCommand : ComputePriceWithOperationCodeCommand = { policyId, operationCode: 'SEMESTER1' }
    computePriceWithOperationCode.withArgs(computePriceCommand).rejects(new OperationCodeNotApplicableError('SEMESTER1', 'partner'))

    // When
    const promise = updatePolicy(updatePolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(OperationCodeNotApplicableError)
  })

  it('should update policy price, start date, term start date and term end date', async () => {
    // Given
    const policyId = 'APP658473092'
    const policy = createPolicyFixture({ id: policyId })
    const startDate = new Date('2020-07-12T00:00:00.000Z')
    const updatePolicyCommand : UpdatePolicyCommand =
        { policyId, operationCode: 'SEMESTER1', startDate }
    const updatePolicy = UpdatePolicy.factory(policyRepository, computePriceWithOperationCode)
    policyRepository.get.withArgs(policyId).resolves(policy)

    const computePriceCommand : ComputePriceWithOperationCodeCommand = { policyId, operationCode: 'SEMESTER1' }
    const newPrice: Price = { premium: 75.32, nbMonthsDue: 5, monthlyPrice: policy.insurance.estimate.monthlyPrice }
    computePriceWithOperationCode.withArgs(computePriceCommand).resolves(newPrice)

    const expectedPolicy = createPolicyFixture({ ...policy })
    expectedPolicy.premium = 75.32
    expectedPolicy.nbMonthsDue = 5
    expectedPolicy.termStartDate = startDate
    expectedPolicy.termEndDate = dayjs(startDate).add(5, 'month').toDate()
    policyRepository.update = sinon.mock()
    policyRepository.update.withExactArgs(policy).resolves()

    // When
    const policyUpdated: Policy = await updatePolicy(updatePolicyCommand)

    // Then
    expect(policyUpdated.premium).to.equal(newPrice.premium)
    expect(policyUpdated.nbMonthsDue).to.equal(newPrice.nbMonthsDue)
    expect(policyUpdated.startDate).to.deep.equal(startDate)
    expect(policyUpdated.termStartDate).to.deep.equal(startDate)
    expect(policyUpdated.termEndDate).to.deep.equal(dayjs(startDate).add(newPrice.nbMonthsDue, 'month').subtract(1, 'day').toDate())
  })

  it('should update policy start date, term start date and term end date', async () => {
    // Given
    const policyId = 'APP658473092'
    const expectedStartDate = new Date('2020-07-12T00:00:00.000Z')
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
    const updatePolicy = UpdatePolicy.factory(policyRepository, computePriceWithOperationCode)
    const command: UpdatePolicyCommand = { policyId, operationCode: undefined, startDate: expectedStartDate }
    const policyUpdated: Policy = await updatePolicy(command)

    // Then
    sinon.assert.calledOnceWithExactly(policyRepository.update, expectedPolicy)
    expect(policyUpdated.startDate).to.deep.equal(expectedPolicy.startDate)
    expect(policyUpdated.termStartDate).to.deep.equal(expectedPolicy.termStartDate)
    expect(policyUpdated.termEndDate).to.deep.equal(expectedPolicy.termEndDate)
  })
})
