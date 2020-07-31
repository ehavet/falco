import { expect, sinon } from '../../../test-utils'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'
import { ComputePriceWithOperationCode } from '../../../../src/app/pricing/domain/compute-price-with-operation-code.usecase'
import { SinonStubbedInstance } from 'sinon'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { OperationCode } from '../../../../src/app/pricing/domain/operation-code'
import { createPolicyFixture } from '../../policies/fixtures/policy.fixture'
import { OperationCodeNotApplicableError } from '../../../../src/app/pricing/domain/operation-code.errors'
import { Price } from '../../../../src/app/pricing/domain/price'
import { policyRepositoryStub } from '../../policies/fixtures/policy-repository.test-doubles'

describe('Prices - Usecase - Compute price with operation code', async () => {
  const policyRepository: SinonStubbedInstance<PolicyRepository> = policyRepositoryStub()
  const partnerRepository: SinonStubbedInstance<PartnerRepository> = { getOperationCodes: sinon.stub(), getByCode: sinon.stub(), getCallbackUrl: sinon.stub(), getOffer: sinon.stub() }

  it('should throw an error if the policy to apply the operation code on does not exist', async () => {
    // Given
    const policyId = 'APP174635432987'
    const computePriceWithOperationCode = ComputePriceWithOperationCode.factory(policyRepository, partnerRepository)
    const computePriceWithOperationCodeCommand = { policyId, operationCode: 'CODE' }

    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))

    // When
    const promise = computePriceWithOperationCode(computePriceWithOperationCodeCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })

  it('should throw an error if operation code is not applicable for partner', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner' })
    const computePriceWithOperationCodeCommand = { policyId, operationCode: 'FULLYEAR' }
    const computePriceWithOperationCode = ComputePriceWithOperationCode.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.SEMESTER1, OperationCode.SEMESTER2])

    // When
    const promise = computePriceWithOperationCode(computePriceWithOperationCodeCommand)

    // Then
    return expect(promise).to.be.rejectedWith(OperationCodeNotApplicableError, 'The operation code FULLYEAR is not applicable for partner : My Partner')
  })

  it('should compute premium on 5 months if provided operation code is SEMESTER1', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner' })
    const computePriceWithOperationCodeCommand = { policyId, operationCode: 'SEMESTER1' }
    const computePriceWithOperationCode = ComputePriceWithOperationCode.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.SEMESTER1, OperationCode.SEMESTER2])
    // When
    const price: Price = await computePriceWithOperationCode(computePriceWithOperationCodeCommand)
    // Then
    return expect(price).to.deep.equal({
      premium: 29.1,
      nbMonthsDue: 5,
      monthlyPrice: 5.82
    })
  })

  it('should compute premium on 5 months if provided operation code is SEMESTER2', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner' })
    const computePriceWithOperationCodeCommand = { policyId, operationCode: 'SEMESTER2' }
    const computePriceWithOperationCode = ComputePriceWithOperationCode.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.SEMESTER1, OperationCode.SEMESTER2])
    // When
    const price: Price = await computePriceWithOperationCode(computePriceWithOperationCodeCommand)
    // Then
    return expect(price).to.deep.equal({
      premium: 29.1,
      nbMonthsDue: 5,
      monthlyPrice: 5.82
    })
  })

  it('should compute premium on 10 months if provided operation code is FULLYEAR', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner' })
    const computePriceWithOperationCodeCommand = { policyId, operationCode: 'FULLYEAR' }
    const computePriceWithOperationCode = ComputePriceWithOperationCode.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationCodes.withArgs(policy.partnerCode).resolves([OperationCode.FULLYEAR])
    // When
    const price: Price = await computePriceWithOperationCode(computePriceWithOperationCodeCommand)
    // Then
    return expect(price).to.deep.equal({
      premium: 58.20,
      nbMonthsDue: 10,
      monthlyPrice: 5.82
    })
  })
})
