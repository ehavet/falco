import { expect, sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { GetPolicySpecificTerms } from '../../../../src/app/policies/domain/specific-terms/get-policy-specific-terms.usecase'
import { SpecificTermsRepository } from '../../../../src/app/policies/domain/specific-terms/specific-terms.repository'
import { SpecificTermsGenerator } from '../../../../src/app/policies/domain/specific-terms/specific-terms.generator'
import { SpecificTerms } from '../../../../src/app/policies/domain/specific-terms/specific-terms'
import { GetPolicySpecificTermsQuery } from '../../../../src/app/policies/domain/specific-terms/get-policy-specific-terms-query'
import { SpecificTermsNotFoundError } from '../../../../src/app/policies/domain/specific-terms/specific-terms.errors'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { PolicyCanceledError } from '../../../../src/app/policies/domain/policies.errors'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { createPolicyFixture } from '../fixtures/policy.fixture'

describe('Policies - Usecase - Get Policy Specific Terms', async () => {
  const specificTermsRepository: SinonStubbedInstance<SpecificTermsRepository> = {
    get: sinon.stub(),
    save: sinon.stub()
  }

  const specificTermsGenerator: SinonStubbedInstance<SpecificTermsGenerator> = {
    generate: sinon.stub(),
    getNameFor: sinon.stub()
  }

  const policyRepository: SinonStubbedInstance<PolicyRepository> = {
    save: sinon.stub(),
    isIdAvailable: sinon.stub(),
    get: sinon.stub(),
    setEmailValidationDate: sinon.stub(),
    updateAfterPayment: sinon.stub(),
    updateAfterSignature: sinon.stub(),
    update: sinon.stub()
  }

  const getPolicySpecificTerms: GetPolicySpecificTerms = GetPolicySpecificTerms.factory(specificTermsRepository, specificTermsGenerator, policyRepository)

  it('should throw an PolicyCanceledError if specific terms policy has been canceled', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const getPolicySpecificTermsQuery: GetPolicySpecificTermsQuery = { policyId }
    const policy: Policy = createPolicyFixture({ id: policyId, status: Policy.Status.Cancelled })
    policyRepository.get.withArgs(policyId).resolves(policy)

    // When
    const promise = getPolicySpecificTerms(getPolicySpecificTermsQuery)

    // Then
    return expect(promise).to.be.rejectedWith(PolicyCanceledError)
  })

  it('should throw an error if the specific terms are not found', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const specificTermsName: string = 'Appenin_Attestation_assurance_habitation_APP854732084.pdf'
    const getPolicySpecificTermsQuery: GetPolicySpecificTermsQuery = { policyId }
    const policy: Policy = createPolicyFixture({ id: policyId, status: Policy.Status.Signed })

    policyRepository.get.withArgs(policyId).resolves(policy)
    specificTermsGenerator.getNameFor.withArgs(policyId).returns(specificTermsName)
    specificTermsRepository.get.withArgs(specificTermsName).rejects(new SpecificTermsNotFoundError(specificTermsName))

    // When
    const promise = getPolicySpecificTerms(getPolicySpecificTermsQuery)

    // Then
    return expect(promise).to.be.rejectedWith(SpecificTermsNotFoundError)
  })

  it('should return the found specific terms', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const specificTermsName: string = 'Appenin_Attestation_assurance_habitation_APP854732084.pdf'
    const getPolicySpecificTermsQuery: GetPolicySpecificTermsQuery = { policyId }
    const policy: Policy = createPolicyFixture({ id: policyId, status: Policy.Status.Signed })

    policyRepository.get.withArgs(policyId).resolves(policy)
    specificTermsGenerator.getNameFor.withArgs(policyId).returns(specificTermsName)

    const expectedSpecificTerms: SpecificTerms = {
      name: 'Appenin_Attestation_assurance_habitation_APP854732084.pdf',
      buffer: Buffer.from('certificate')
    }
    specificTermsRepository.get.withArgs(specificTermsName).resolves(expectedSpecificTerms)

    // When
    const specificTerms: SpecificTerms = await getPolicySpecificTerms(getPolicySpecificTermsQuery)

    // Then
    expect(specificTerms).to.deep.equal(expectedSpecificTerms)
  })
})
