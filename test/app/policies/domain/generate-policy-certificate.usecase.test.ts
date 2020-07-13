import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { expect, sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { CertificateRepository } from '../../../../src/app/policies/domain/certificate/certificate.repository'
import { Certificate } from '../../../../src/app/policies/domain/certificate/certificate'
import { GeneratePolicyCertificate } from '../../../../src/app/policies/domain/certificate/generate-policy-certificate.usecase'
import { GeneratePolicyCertificateQuery } from '../../../../src/app/policies/domain/certificate/generate-policy-certificate-query'

describe('Policies - Usecase - Generate policy certificate', async () => {
  const policyRepository: SinonStubbedInstance<PolicyRepository> = {
    get: sinon.stub(),
    save: sinon.stub(),
    isIdAvailable: sinon.stub(),
    setEmailValidationDate: sinon.stub()
  }

  const certificateRepository: SinonStubbedInstance<CertificateRepository> = { generate: sinon.mock() }

  const generatePolicyCertificate: GeneratePolicyCertificate = GeneratePolicyCertificate.factory(policyRepository, certificateRepository)

  it('should return the certificate generated', async () => {
    // Given
    const policyId: string = 'APP854732084'
    const policyFromDb: Policy = createPolicyFixture({ id: policyId })
    const generatePolicyCertificateQuery: GeneratePolicyCertificateQuery = { policyId }
    policyRepository.get.withArgs(policyId).resolves(policyFromDb)

    const expectedGeneratedCertificate: Certificate = { buffer: Buffer.from('certificate') }
    certificateRepository.generate.withArgs(policyFromDb).resolves(expectedGeneratedCertificate)

    // When
    const generatedCertificate: Certificate = await generatePolicyCertificate(generatePolicyCertificateQuery)

    // Then
    expect(generatedCertificate).to.deep.equal(expectedGeneratedCertificate)
  })
})
