import pdftk from 'node-pdftk'
import { CertificateGenerator } from '../../../../src/app/policies/domain/certificate/certificate.generator'
import { CertificatePdfGenerator } from '../../../../src/app/policies/infrastructure/certificate-pdf/certificate-pdf.generator'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { expect } from '../../../test-utils'
import { Certificate } from '../../../../src/app/policies/domain/certificate/certificate'
import { PDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdf-processor'
import { PDFtkPDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdftk.pdf-processor'

describe('Policies - Infra - Certificate PDF Generator', async () => {
  const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor()
  const certificatePdfRepository : CertificateGenerator = new CertificatePdfGenerator(pdfProcessor)

  describe('For non demo partners', async () => {
    it('should generate a new certificate with no specimen stamp on it', async () => {
      // Given
      const policy: Policy = createPolicyFixture()

      // When
      const certificate: Certificate = await certificatePdfRepository.generate(policy)

      // Then
      const certificateUncompressed = await pdftk.input(certificate.buffer).uncompress().output()
      expect(certificate.name).to.equal('Appenin_Attestation_assurance_habitation_APP753210859.pdf')
      expect(certificateUncompressed.includes('SPECIMEN')).to.be.false
      expect(certificateUncompressed.includes('Jean Dupont')).to.be.true
      expect(certificateUncompressed.includes('13 rue du loup garou')).to.be.true
      expect(certificateUncompressed.includes('91100 Corbeil\\055Essones')).to.be.true
      expect(certificateUncompressed.includes('est assur\\351(e) par le contrat Assurance Habitation APPENIN n\\260 APP 753 210 859')).to.be.true
      expect(certificateUncompressed.includes('depuis le 05\\05701\\0572020 \\(prochaine \\351ch\\351ance le 05\\05701\\0572020\\)')).to.be.true
    }).timeout(10000)
  })

  describe('For demo partners', async () => {
    it('should generate a new certificate with a specimen stamp on it', async () => {
      // Given
      const policy: Policy = createPolicyFixture({ partnerCode: 'demo-beta' })

      // When
      const certificate: Certificate = await certificatePdfRepository.generate(policy)

      // Then
      const certificateUncompressed = await pdftk.input(certificate.buffer).uncompress().output()
      expect(certificate.name).to.equal('Appenin_Attestation_assurance_habitation_APP753210859.pdf')
      expect(certificateUncompressed.includes('SPECIMEN')).to.be.true
      expect(certificateUncompressed.includes('Jean Dupont')).to.be.true
      expect(certificateUncompressed.includes('13 rue du loup garou')).to.be.true
      expect(certificateUncompressed.includes('91100 Corbeil\\055Essones')).to.be.true
      expect(certificateUncompressed.includes('est assur\\351(e) par le contrat Assurance Habitation APPENIN n\\260 APP 753 210 859')).to.be.true
      expect(certificateUncompressed.includes('depuis le 05\\05701\\0572020 \\(prochaine \\351ch\\351ance le 05\\05701\\0572020\\)')).to.be.true
    }).timeout(10000)
  })
})
