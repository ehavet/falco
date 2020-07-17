import { expect, sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { GetPolicySpecificTerms } from '../../../../src/app/policies/domain/specific-terms/get-policy-specific-terms.usecase'
import { SpecificTermsRepository } from '../../../../src/app/policies/domain/specific-terms/specific-terms.repository'
import { SpecificTermsGenerator } from '../../../../src/app/policies/domain/specific-terms/specific-terms.generator'
import { SpecificTerms } from '../../../../src/app/policies/domain/specific-terms/specific-terms'
import { GetPolicySpecificTermsQuery } from '../../../../src/app/policies/domain/specific-terms/get-policy-specific-terms-query'
import { SpecificTermsNotFoundError } from '../../../../src/app/policies/domain/specific-terms/specific-terms.errors'

describe('Policies - Usecase - Get Policy Specific Terms', async () => {
  const specificTermsRepository: SinonStubbedInstance<SpecificTermsRepository> = {
    get: sinon.stub(),
    save: sinon.stub()
  }

  const specificTermsGenerator: SinonStubbedInstance<SpecificTermsGenerator> = {
    generate: sinon.stub(),
    getNameFor: sinon.stub()
  }

  const getPolicySpecificTerms: GetPolicySpecificTerms = GetPolicySpecificTerms.factory(specificTermsRepository, specificTermsGenerator)

  it('should return the found specific terms', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const specificTermsName: string = 'Appenin_Attestation_assurance_habitation_APP854732084.pdf'
    const getPolicySpecificTermsQuery: GetPolicySpecificTermsQuery = { policyId }

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

  it('should throw an error if the specific terms are not found', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const specificTermsName: string = 'Appenin_Attestation_assurance_habitation_APP854732084.pdf'
    const getPolicySpecificTermsQuery: GetPolicySpecificTermsQuery = { policyId }

    specificTermsGenerator.getNameFor.withArgs(policyId).returns(specificTermsName)

    specificTermsRepository.get.withArgs(specificTermsName).rejects(new SpecificTermsNotFoundError(specificTermsName))

    // When
    const promise = getPolicySpecificTerms(getPolicySpecificTermsQuery)

    // Then
    return expect(promise).to.be.rejectedWith(SpecificTermsNotFoundError)
  })
})
