import { expect, sinon } from '../../../test-utils'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'
import { ComputePriceWithOperationalCode } from '../../../../src/app/pricing/domain/compute-price-with-operational-code.usecase'
import { SinonStubbedInstance } from 'sinon'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { PartnerRepository } from '../../../../src/app/partners/domain/partner.repository'
import { OperationalCode } from '../../../../src/app/pricing/domain/operational-code'
import { createPolicyFixture } from '../../policies/fixtures/policy.fixture'
import { OperationalCodeNotApplicableError } from '../../../../src/app/pricing/domain/operational-code.errors'

describe('Prices - Usecase - Compute price with operational code', async () => {
  const policyRepository: SinonStubbedInstance<PolicyRepository> = { get: sinon.stub(), save: sinon.stub(), isIdAvailable: sinon.stub(), setEmailValidationDate: sinon.stub(), updateAfterPayment: sinon.stub(), updateAfterSignature: sinon.stub() }
  const partnerRepository: SinonStubbedInstance<PartnerRepository> = { getOperationalCodes: sinon.stub(), getByCode: sinon.stub(), getCallbackUrl: sinon.stub(), getOffer: sinon.stub() }

  it('should throw an error if the policy to apply the operational code on does not exist', async () => {
    // Given
    const policyId = 'APP174635432987'
    const computePriceWithOperationalCode = ComputePriceWithOperationalCode.factory(policyRepository, partnerRepository)
    const computePriceWithOperationalCodeCommand = { policyId, operationalCode: 'CODE' }

    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))

    // When
    const promise = computePriceWithOperationalCode(computePriceWithOperationalCodeCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })

  it('should throw an error if operational code is not applicable for partner', async () => {
    // Given
    const policyId = 'APP174635432987'
    const policy = createPolicyFixture({ id: policyId, partnerCode: 'My Partner' })
    const computePriceWithOperationalCodeCommand = { policyId, operationalCode: 'FULLYEAR' }
    const computePriceWithOperationalCode = ComputePriceWithOperationalCode.factory(policyRepository, partnerRepository)

    policyRepository.get.withArgs(policyId).resolves(policy)
    partnerRepository.getOperationalCodes.withArgs(policy.partnerCode).resolves([OperationalCode.SEMESTER1, OperationalCode.SEMESTER2])

    // When
    const promise = computePriceWithOperationalCode(computePriceWithOperationalCodeCommand)

    // Then
    return expect(promise).to.be.rejectedWith(OperationalCodeNotApplicableError, 'The operational code FULLYEAR is not applicable for partner : My Partner')
  })
})
