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
  describe('When on production mode', () => {
    const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor({ productionMode: true })
    const certificatePdfRepository : CertificateGenerator = new CertificatePdfGenerator(pdfProcessor)
    let certificate: Certificate

    before('generate certificate for a normal partner', async () => {
      // Given
      const policy: Policy = createPolicyFixture({ partnerCode: 'appeninPartner' })
      // When
      certificate = await certificatePdfRepository.generate(policy)
    })

    it('should retrieve policies information on generated certificate', async () => {
      // Then
      const certificateUncompressed = await pdftk.input(certificate.buffer).uncompress().output()
      expect(certificate.name).to.equal('Appenin_Attestation_assurance_habitation_APP753210859.pdf')
      expect(certificateUncompressed.includes('Jean Dupont')).to.be.true
      expect(certificateUncompressed.includes('13 rue du loup garou')).to.be.true
      expect(certificateUncompressed.includes('91100 Corbeil\\055Essones')).to.be.true
      expect(certificateUncompressed.includes('est assur\\351(e) par le contrat Assurance Habitation APPENIN n\\260 APP 753 210 859')).to.be.true
      expect(certificateUncompressed.includes('depuis le 05\\05701\\0572020 \\(prochaine \\351ch\\351ance le 05\\05701\\0572020\\)')).to.be.true
    })

    describe('For a partner which is not a demo partner', async () => {
      it('should not add a specimen stamp on generated certificate', async () => {
        // Then
        const certificateUncompressed = await pdftk.input(certificate.buffer).uncompress().output()
        expect(certificateUncompressed.includes('SPECIMEN')).to.be.false
      })
    })

    describe('For a demo partner', async () => {
      it('should add a specimen stamp on generated certificate', async () => {
        // Given
        const demoPolicy: Policy = createPolicyFixture({ partnerCode: 'demo-beta' })

        // When
        const demoPartnerCertificate = await certificatePdfRepository.generate(demoPolicy)

        // Then
        const certificateUncompressed = await pdftk.input(demoPartnerCertificate.buffer).uncompress().output()
        expect(certificateUncompressed.includes('SPECIMEN')).to.be.true
      })
    })
  })

  describe('When not on production mode', () => {
    const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor({ productionMode: false })
    const certificatePdfRepository : CertificateGenerator = new CertificatePdfGenerator(pdfProcessor)
    let certificate: Certificate
    let demoPartnerCertificate: Certificate

    before('generate certificate with different partners', async () => {
      // Given
      const policy: Policy = createPolicyFixture({ partnerCode: 'appeninPartner' })
      const demoPartnerpolicy: Policy = createPolicyFixture({ partnerCode: 'demo-beta' })

      // When
      certificate = await certificatePdfRepository.generate(policy)
      demoPartnerCertificate = await certificatePdfRepository.generate(demoPartnerpolicy)
    })

    it('should retrieve policies information on generated certificate', async () => {
      // Then
      const certificateUncompressed = await pdftk.input(certificate.buffer).uncompress().output()
      expect(certificate.name).to.equal('Appenin_Attestation_assurance_habitation_APP753210859.pdf')
      expect(certificateUncompressed.includes('Jean Dupont')).to.be.true
      expect(certificateUncompressed.includes('13 rue du loup garou')).to.be.true
      expect(certificateUncompressed.includes('91100 Corbeil\\055Essones')).to.be.true
      expect(certificateUncompressed.includes('est assur\\351(e) par le contrat Assurance Habitation APPENIN n\\260 APP 753 210 859')).to.be.true
      expect(certificateUncompressed.includes('depuis le 05\\05701\\0572020 \\(prochaine \\351ch\\351ance le 05\\05701\\0572020\\)')).to.be.true
    })

    describe('For a partner which is not a demo partner', async () => {
      it('should add a specimen stamp on generated certificate', async () => {
        // Then
        const certificateUncompressed = await pdftk.input(certificate.buffer).uncompress().output()
        expect(certificateUncompressed.includes('SPECIMEN')).to.be.true
      })
    })

    describe('For a demo partners', async () => {
      it('should add a specimen stamp on generated certificate', async () => {
        // Then
        const certificateUncompressed = await pdftk.input(demoPartnerCertificate.buffer).uncompress().output()
        expect(certificateUncompressed.includes('SPECIMEN')).to.be.true
      })
    })
  })
})
