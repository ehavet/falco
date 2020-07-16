import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { expect, sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { CertificateRepository } from '../../../../src/app/policies/domain/certificate/certificate.repository'
import { Certificate } from '../../../../src/app/policies/domain/certificate/certificate'
import { GeneratePolicyCertificate } from '../../../../src/app/policies/domain/certificate/generate-policy-certificate.usecase'
import { GeneratePolicyCertificateQuery } from '../../../../src/app/policies/domain/certificate/generate-policy-certificate-query'
import { CannotGeneratePolicyNotApplicableError } from '../../../../src/app/policies/domain/certificate/certificate.errors'

describe('Policies - Usecase - Generate policy certificate', async () => {
  const policyRepository: SinonStubbedInstance<PolicyRepository> = {
    get: sinon.stub(),
    save: sinon.stub(),
    isIdAvailable: sinon.stub(),
    setEmailValidationDate: sinon.stub(),
    updateAfterPayment: sinon.stub()
  }

  const certificateRepository: SinonStubbedInstance<CertificateRepository> = { generate: sinon.mock() }

  const generatePolicyCertificate: GeneratePolicyCertificate = GeneratePolicyCertificate.factory(policyRepository, certificateRepository)

  afterEach(() => {
    certificateRepository.generate.reset()
  })

  it('should return the certificate generated', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const policyFromDb: Policy = createPolicyFixture({ id: policyId, status: Policy.Status.Applicable })
    const generatePolicyCertificateQuery: GeneratePolicyCertificateQuery = { policyId }
    policyRepository.get.withArgs(policyId).resolves(policyFromDb)

    const expectedGeneratedCertificate: Certificate = {
      name: '`Appenin_Attestation_assurance_habitation_APP854732084.pdf`',
      buffer: Buffer.from('certificate')
    }
    certificateRepository.generate.withArgs(policyFromDb).resolves(expectedGeneratedCertificate)

    // When
    const generatedCertificate: Certificate = await generatePolicyCertificate(generatePolicyCertificateQuery)

    // Then
    expect(generatedCertificate).to.deep.equal(expectedGeneratedCertificate)
  })

  it('should throw an error if the policy status is different than applicable', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const policyFromDb: Policy = createPolicyFixture({ id: policyId, status: Policy.Status.Signed })
    const generatePolicyCertificateQuery: GeneratePolicyCertificateQuery = { policyId }
    policyRepository.get.withArgs(policyId).resolves(policyFromDb)

    // When
    const promise = generatePolicyCertificate(generatePolicyCertificateQuery)

    // Then
    return expect(promise).to.be.rejectedWith(CannotGeneratePolicyNotApplicableError)
  })
})
