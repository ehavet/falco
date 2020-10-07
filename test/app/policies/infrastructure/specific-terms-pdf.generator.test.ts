import dayjs from 'dayjs'
import pdftk from 'node-pdftk'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { dateFaker, expect } from '../../../test-utils'
import { SpecificTermsPdfGenerator } from '../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-pdf.generator'
import { PDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdf-processor'
import { PDFtkPDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdftk.pdf-processor'

describe('Policies - Infra - Specific terms PDF Generator', async () => {
  const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor()
  const specificTermsPdfGenerator : SpecificTermsPdfGenerator = new SpecificTermsPdfGenerator(pdfProcessor)

  describe('For non demo partners', async () => {
    it('should generate a new specific terms document with no specimen stamp', async () => {
      // Given
      dateFaker.setCurrentDate(new Date('2020-07-12T00:00:00.000Z'))
      const policy: Policy = createPolicyFixture({ partnerCode: 'essca' })
      policy.termEndDate = dayjs(policy.termStartDate).add(1, 'month').toDate()
      policy.insurance.productCode = 'APP1234'

      // When
      const specificTerms = await specificTermsPdfGenerator.generate(policy)

      // Then
      const specificTermsUncompressed = await pdftk.input(specificTerms.buffer).uncompress().output()
      expect(specificTerms.name).to.equal('Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
      expect(specificTermsUncompressed.includes('SPECIMEN')).to.be.false
      expect(specificTermsUncompressed.includes('\\300 EFFET DU 05\\05701\\0572020')).to.be.true
      expect(specificTermsUncompressed.includes('n\\260APP 753 210 859')).to.be.true
      expect(specificTermsUncompressed.includes('Votre contrat arrivera \\340 \\351ch\\351ance le 05\\05702\\0572020')).to.be.true
      expect(specificTermsUncompressed.includes('votre tarif est de 69\\05484 \\200')).to.be.true
      expect(specificTermsUncompressed.includes('Jean Dupont')).to.be.true
      expect(specificTermsUncompressed.includes('jeandupont\\100email\\056com')).to.be.true
      expect(specificTermsUncompressed.includes('John Doe')).to.be.true
      expect(specificTermsUncompressed.includes('13 rue du loup garou')).to.be.true
      expect(specificTermsUncompressed.includes('91100 Corbeil\\055Essones')).to.be.true
      expect(specificTermsUncompressed.includes('Votre logement est compos\\351 de 2 pi\\350ce\\(s\\) principale\\(s\\)')).to.be.true
      expect(specificTermsUncompressed.includes('valeur mobili\\350re par \\351v\\351nement : 7 000 \\200')).to.be.true
      expect(specificTermsUncompressed.includes('pour les autres garanties de protection de vos biens : 150 \\200')).to.be.true
      expect(specificTermsUncompressed.includes('Fait \\340 Paris, le 12\\05707\\0572020')).to.be.true
    }).timeout(10000)
  })

  describe('For non demo partners', async () => {
    it('should generate a new specific terms document with a specimen stamp on it', async () => {
      // Given
      dateFaker.setCurrentDate(new Date('2020-07-12T00:00:00.000Z'))
      const policy: Policy = createPolicyFixture({ partnerCode: 'demo-student' })

      // When
      const specificTerms = await specificTermsPdfGenerator.generate(policy)

      // Then
      const specificTermsUncompressed = await pdftk.input(specificTerms.buffer).uncompress().output()
      expect(specificTermsUncompressed.includes('SPECIMEN')).to.be.true
    }).timeout(10000)
  })
})
