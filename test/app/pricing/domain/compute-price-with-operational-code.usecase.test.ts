import { expect, sinon } from '../../../test-utils'
import { PolicyNotFoundError } from '../../../../src/app/policies/domain/policies.errors'
import { ComputePriceWithOperationalCode } from '../../../../src/app/pricing/domain/compute-price-with-operational-code.usecase'

describe('Prices - Usecase - Compute price with operational code', async () => {
  it('should throw an error if the policy to apply the operational code on does not exist', async () => {
    // Given
    const policyRepository = { get: sinon.stub(), save: sinon.stub(), isIdAvailable: sinon.stub(), setEmailValidationDate: sinon.stub(), updateAfterPayment: sinon.stub(), updateAfterSignature: sinon.stub() }
    const policyId = 'APP174635432987'
    const computePriceWithOperationalCode = ComputePriceWithOperationalCode.factory(policyRepository)
    const computePriceWithOperationalCodeCommand = { policyId, operationalCode: 'CODE' }

    policyRepository.get.withArgs(policyId).rejects(new PolicyNotFoundError(policyId))

    // When
    const promise = computePriceWithOperationalCode(computePriceWithOperationalCodeCommand)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyNotFoundError)
  })
})
