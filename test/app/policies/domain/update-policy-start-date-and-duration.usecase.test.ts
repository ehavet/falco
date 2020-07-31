import dayjs from 'dayjs'
import { expect, sinon } from '../../../test-utils'
import { PolicyNotFoundError, PolicyNotUpdatable } from '../../../../src/app/policies/domain/policies.errors'
import {
  UpdatePolicyStartDateAndDuration,
  UpdatePolicyStartDateAndDurationCommand
} from '../../../../src/app/policies/domain/update-policy-start-date-and-duration.usecase'
import { SinonStubbedMember } from 'sinon'
import { OperationCodeNotApplicableError } from '../../../../src/app/pricing/domain/operation-code.errors'
import { ComputePriceWithOperationCodeCommand } from '../../../../src/app/pricing/domain/compute-price-with-operation-code-command'
import { ComputePriceWithOperationCode } from '../../../../src/app/pricing/domain/compute-price-with-operation-code.usecase'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { Price } from '../../../../src/app/pricing/domain/price'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'

describe('Policies - Usecase - Update Policy start date and duration', async () => {
  const policyRepository = policyRepositoryStub()
  const computePriceWithOperationCode : SinonStubbedMember<ComputePriceWithOperationCode> = sinon.stub()

  it('should throw an error if the policy does not exist', async () => {
    // Given
    const policyId = 'APP658473092'
    const updatePolicyStartDateAndDurationCommand : UpdatePolicyStartDateAndDurationCommand =
            { policyId, operationCode: 'SEMESTER1', startDate: new Date('2020-02-12T00:00:00.000Z') }
    const updatePolicyStartDateAndDuration = UpdatePolicyStartDateAndDuration.factory(policyRepository, computePriceWithOperationCode)
    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))

    // When
    const promise = updatePolicyStartDateAndDuration(updatePolicyStartDateAndDurationCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })

  it('should not update the policy if it is already Signed or Payed or Applicable', async () => {
    // Given
    const policyId = 'APP658473092'
    const policy = createPolicyFixture({ id: policyId, status: Policy.Status.Signed })
    const updatePolicyStartDateAndDurationCommand : UpdatePolicyStartDateAndDurationCommand =
        { policyId, operationCode: 'SEMESTER1', startDate: new Date('2020-02-12T00:00:00.000Z') }
    const updatePolicyStartDateAndDuration = UpdatePolicyStartDateAndDuration.factory(policyRepository, computePriceWithOperationCode)
    policyRepository.get.withArgs(policyId).resolves(policy)

    // When
    const promise = updatePolicyStartDateAndDuration(updatePolicyStartDateAndDurationCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotUpdatable)
  })

  it('should throw an error if the operation code does not exist', async () => {
    // Given
    const policyId = 'APP658473092'
    const updatePolicyStartDateAndDurationCommand : UpdatePolicyStartDateAndDurationCommand =
        { policyId, operationCode: 'SEMESTER1', startDate: new Date('2020-02-12T00:00:00.000Z') }
    const updatePolicyStartDateAndDuration = UpdatePolicyStartDateAndDuration.factory(policyRepository, computePriceWithOperationCode)
    policyRepository.get.withArgs(policyId).resolves(createPolicyFixture())

    const computePriceCommand : ComputePriceWithOperationCodeCommand = { policyId, operationCode: 'SEMESTER1' }
    computePriceWithOperationCode.withArgs(computePriceCommand).rejects(new OperationCodeNotApplicableError('SEMESTER1', 'partner'))

    // When
    const promise = updatePolicyStartDateAndDuration(updatePolicyStartDateAndDurationCommand)

    // Then
    return expect(promise).to.be.rejectedWith(OperationCodeNotApplicableError)
  })

  it('should update and save the policy with the new price, start date, term start date and term end date', async () => {
    // Given
    const policyId = 'APP658473092'
    const policy = createPolicyFixture({ id: policyId })
    const startDate = new Date('2020-07-12T00:00:00.000Z')
    const updatePolicyStartDateAndDurationCommand : UpdatePolicyStartDateAndDurationCommand =
        { policyId, operationCode: 'SEMESTER1', startDate }
    const updatePolicyStartDateAndDuration = UpdatePolicyStartDateAndDuration.factory(policyRepository, computePriceWithOperationCode)
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
    const policyUpdated: Policy = await updatePolicyStartDateAndDuration(updatePolicyStartDateAndDurationCommand)

    // Then
    expect(policyUpdated.premium).to.equal(newPrice.premium)
    expect(policyUpdated.nbMonthsDue).to.equal(newPrice.nbMonthsDue)
    expect(policyUpdated.startDate).to.deep.equal(startDate)
    expect(policyUpdated.termStartDate).to.deep.equal(startDate)
    expect(policyUpdated.termEndDate).to.deep.equal(dayjs(startDate).add(newPrice.nbMonthsDue, 'month').subtract(1, 'day').toDate())
  })
})
