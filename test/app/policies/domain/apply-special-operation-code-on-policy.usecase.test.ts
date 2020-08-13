import { dateFaker, expect, sinon } from '../../../test-utils'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'
import { SinonStubbedInstance } from 'sinon'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { OperationCode } from '../../../../src/app/policies/domain/operation-code'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { OperationCodeNotApplicableError } from '../../../../src/app/policies/domain/operation-code.errors'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'
import { ApplySpecialOperationCodeOnPolicy } from '../../../../src/app/policies/domain/apply-special-operation-code-on-policy.usecase'
import { Policy } from '../../../../src/app/policies/domain/policy'

describe('Policies - Usecase - Apply special operation code on policy', async () => {
  const now: Date = new Date('2022-01-05T00:00:00')
  const policyStartDate = new Date('2022-01-05T00:00:00')
  const policyRepository: SinonStubbedInstance<PolicyRepository> = policyRepositoryStub()
  const partnerRepository: SinonStubbedInstance<PartnerRepository> = { getOperationCodes: sinon.stub(), getByCode: sinon.stub(), getCallbackUrl: sinon.stub(), getOffer: sinon.stub() }

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
  })

  it('should throw an error if the policy to apply the operation code on does not exist', async () => {
    // Given
    const policyId = 'APP174635432987'
    const applySpecialOperationCodeOnPolicy = ApplySpecialOperationCodeOnPolicy.factory(policyRepository, partnerRepository)
    const applySpecialOperationCodeOnPolicyCommand = { policyId, operationCode: 'CODE' }

    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))

    // When
    const promise = applySpecialOperationCodeOnPolicy(applySpecialOperationCodeOnPolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })

  it('should throw an error if operation code is not applicable for partner', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner' })
    const applySpecialOperationCodeOnPolicyCommand = { policyId, operationCode: 'FULLYEAR' }
    const applySpecialOperationCodeOnPolicy = ApplySpecialOperationCodeOnPolicy.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.SEMESTER1, OperationCode.SEMESTER2])

    // When
    const promise = applySpecialOperationCodeOnPolicy(applySpecialOperationCodeOnPolicyCommand)

    // Then
    return expect(promise).to.be.rejectedWith(OperationCodeNotApplicableError, 'The operation code FULLYEAR is not applicable for partner : My Partner')
  })

  it('should update premium on 5 months if provided operation code is SEMESTER1', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner', startDate: policyStartDate })
    const applySpecialOperationCodeOnPolicyCommand = { policyId, operationCode: 'SEMESTER1' }
    const applySpecialOperationCodeOnPolicy = ApplySpecialOperationCodeOnPolicy.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.SEMESTER1, OperationCode.SEMESTER2])
    // When
    const expectedPolicy: Policy = await applySpecialOperationCodeOnPolicy(applySpecialOperationCodeOnPolicyCommand)
    // Then
    expect(expectedPolicy.premium).to.be.equal(29.1)
    expect(expectedPolicy.nbMonthsDue).to.be.equal(5)
    expect(expectedPolicy.insurance.estimate.monthlyPrice).to.be.equal(5.82)
    expect(expectedPolicy.termEndDate).to.deep.equal(new Date('2022-06-04T00:00:00'))
  })

  it('should update premium on 5 months if provided operation code is SEMESTER2', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner', startDate: policyStartDate })
    const applySpecialOperationCodeOnPolicyCommand = { policyId, operationCode: 'SEMESTER2' }
    const applySpecialOperationCodeOnPolicy = ApplySpecialOperationCodeOnPolicy.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.SEMESTER1, OperationCode.SEMESTER2])
    // When
    const expectedPolicy: Policy = await applySpecialOperationCodeOnPolicy(applySpecialOperationCodeOnPolicyCommand)
    // Then
    expect(expectedPolicy.premium).to.be.equal(29.1)
    expect(expectedPolicy.nbMonthsDue).to.be.equal(5)
    expect(expectedPolicy.insurance.estimate.monthlyPrice).to.be.equal(5.82)
    expect(expectedPolicy.termEndDate).to.deep.equal(new Date('2022-06-04T00:00:00'))
  })

  it('should update premium on 10 months if provided operation code is FULLYEAR', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner', startDate: policyStartDate })
    const applySpecialOperationCodeOnPolicyCommand = { policyId, operationCode: 'FULLYEAR' }
    const applySpecialOperationCodeOnPolicy = ApplySpecialOperationCodeOnPolicy.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.FULLYEAR])
    // When
    const expectedPolicy: Policy = await applySpecialOperationCodeOnPolicy(applySpecialOperationCodeOnPolicyCommand)
    // Then
    expect(expectedPolicy.premium).to.be.equal(58.20)
    expect(expectedPolicy.nbMonthsDue).to.be.equal(10)
    expect(expectedPolicy.insurance.estimate.monthlyPrice).to.be.equal(5.82)
    expect(expectedPolicy.termEndDate).to.deep.equal(new Date('2022-11-04T00:00:00'))
  })

  it('should update premium on 12 months if provided operation code is BLANK', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner', startDate: policyStartDate })
    const applySpecialOperationCodeOnPolicyCommand = { policyId, operationCode: 'BLANK' }
    const applySpecialOperationCodeOnPolicy = ApplySpecialOperationCodeOnPolicy.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.FULLYEAR])
    // When
    const expectedPolicy: Policy = await applySpecialOperationCodeOnPolicy(applySpecialOperationCodeOnPolicyCommand)
    // Then
    expect(expectedPolicy.premium).to.be.equal(69.84)
    expect(expectedPolicy.nbMonthsDue).to.be.equal(12)
    expect(expectedPolicy.insurance.estimate.monthlyPrice).to.be.equal(5.82)
    expect(expectedPolicy.termEndDate).to.deep.equal(new Date('2023-01-04T00:00:00'))
  })

  it('should apply operation code when valid code contains spaces or non alphanumeric characters', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner', startDate: policyStartDate })
    const applySpecialOperationCodeOnPolicy = ApplySpecialOperationCodeOnPolicy.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.FULLYEAR])

    const codesList = ['FULL   YEAR', 'FULL_YEAR', 'FULL.YEAR', 'fullyear', 'full@year', 'FUll!ç&Year']
    codesList.forEach(async (code) => {
      // When
      const applySpecialOperationCodeOnPolicyCommand = { policyId, operationCode: code }
      const policy = await applySpecialOperationCodeOnPolicy(applySpecialOperationCodeOnPolicyCommand)
      // Then
      expect(policy.premium).to.be.equal(58.20)
      expect(policy.nbMonthsDue).to.be.equal(10)
      expect(policy.insurance.estimate.monthlyPrice).to.be.equal(5.82)
      expect(policy.termEndDate).to.deep.equal(new Date('2022-11-04T00:00:00'))
    })
  })
})
