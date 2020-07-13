import { CertificateRepository } from '../../../../src/app/policies/domain/certificate/certificate.repository'
import { CertificatePdfRepository } from '../../../../src/app/policies/infrastructure/certificate-pdf/certificate-pdf.repository'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { expect } from '../../../test-utils'
import { Certificate } from '../../../../src/app/policies/domain/certificate/certificate'

describe('Policies - Infra - Certificate PDF Repository', async () => {
  it('should generate a new certificate', async () => {
    // Given
    const policy: Policy = createPolicyFixture()
    const certificatePdfRepository : CertificateRepository = new CertificatePdfRepository()

    // When
    const certificate: Certificate = await certificatePdfRepository.generate(policy)

    // Then
    expect(certificate.buffer.includes('Jean Dupont')).to.be.true
    expect(certificate.buffer.includes('13 rue du loup garou')).to.be.true
    expect(certificate.buffer.includes('91100 Corbeil\\055Essones')).to.be.true
    expect(certificate.buffer.includes('est assur\\351(e) par le contrat Assurance Habitation APPENIN n\\260 APP 753 210 859')).to.be.true
    expect(certificate.buffer.includes('depuis le 05\\05701\\0572020 \\(prochaine \\351ch\\351ance le 05\\05701\\0572020\\)')).to.be.true
  })
})
