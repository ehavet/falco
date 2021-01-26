import pdftk from 'node-pdftk'
import dayjs from 'dayjs'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { dateFaker, expect } from '../../../test-utils'
import { SpecificTermsPdfGenerator } from '../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-pdf.generator'
import { PDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdf-processor'
import { PDFtkPDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdftk.pdf-processor'
import { SpecificTerms } from '../../../../src/app/policies/domain/specific-terms/specific-terms'

describe('Policies - Infra - Specific terms PDF Generator', () => {
  describe('When on production mode', () => {
    const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor({ productionMode: true })
    const specificTermsPdfGenerator : SpecificTermsPdfGenerator = new SpecificTermsPdfGenerator(pdfProcessor)

    let policy: Policy
    let demoStudentPartnerPolicy: Policy
    let demoPartnerPolicy: Policy
    let specificTerms: SpecificTerms

    /*
      INFO: partners demo and e-mobilia's CP templates are generated with a different mechanism compared to
      other partners, this is why we have two tests, one for demo and the other for demo-student
    */
    let demoStudentPartnerSpecificTerms: SpecificTerms
    let demoPartnerSpecificTerms: SpecificTerms

    before(async function () {
      this.timeout(10000)
      // GIVEN
      dateFaker.setCurrentDate(new Date('2020-07-12T00:00:00.000Z'))
      policy = createPolicyFixture({ partnerCode: 'essca' })
      policy.termEndDate = dayjs(policy.termStartDate).add(1, 'month').toDate()
      policy.insurance.productCode = 'APP1234'

      demoStudentPartnerPolicy = createPolicyFixture({ partnerCode: 'demo-student' })
      demoStudentPartnerPolicy.insurance.productCode = 'APP1234'

      demoPartnerPolicy = createPolicyFixture({ partnerCode: 'demo' })
      demoPartnerPolicy.insurance.productCode = 'APP1234'
      // When
      specificTerms = await specificTermsPdfGenerator.generate(policy)

      demoStudentPartnerSpecificTerms = await specificTermsPdfGenerator.generate(demoStudentPartnerPolicy)

      demoPartnerSpecificTerms = await specificTermsPdfGenerator.generate(demoPartnerPolicy)
    })

    it('should generate a new specific terms document', async () => {
      // Then
      const specificTermsUncompressed = await pdftk.input(specificTerms.buffer).uncompress().output()
      expect(specificTerms.name).to.equal('Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
      expect(specificTermsUncompressed.includes('\\300 EFFET DU 05\\05701\\0572020')).to.be.true
      expect(specificTermsUncompressed.includes('n\\260APP 753 210 859')).to.be.true
      expect(specificTermsUncompressed.includes('Votre contrat arrivera \\340 \\351ch\\351ance le 05\\05702\\0572020')).to.be.true
      expect(specificTermsUncompressed.includes('votre tarif est de 69\\05484 \\200')).to.be.true
      expect(specificTermsUncompressed.includes('Jean Dupont')).to.be.true
      expect(specificTermsUncompressed.includes('jeandupont\\100email\\056com')).to.be.true
      expect(specificTermsUncompressed.includes('John Doe')).to.be.true
      expect(specificTermsUncompressed.includes('13 rue du loup garou')).to.be.true
      expect(specificTermsUncompressed.includes('91100 Corbeil\\055Essonnes')).to.be.true
      expect(specificTermsUncompressed.includes('Votre logement est compos\\351 de 2 pi\\350ce\\(s\\) principale\\(s\\)')).to.be.true
      expect(specificTermsUncompressed.includes('valeur mobili\\350re par \\351v\\351nement : 7 000 \\200')).to.be.true
      expect(specificTermsUncompressed.includes('pour les autres garanties de protection de vos biens : 150 \\200')).to.be.true
      expect(specificTermsUncompressed.includes('Fait \\340 Paris, le 12\\05707\\0572020')).to.be.true
    }).timeout(10000)

    it('should generate a new specific terms document (new CP template)', async () => {
      // Then
      const specificTermsUncompressed = await pdftk.input(demoPartnerSpecificTerms.buffer).uncompress().output()
      expect(specificTerms.name).to.equal('Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
      expect(specificTermsUncompressed.includes('05\\05701\\0572020')).to.be.true
      expect(specificTermsUncompressed.includes('APP)-200(753)-200(210)-200(859')).to.be.true
      expect(specificTermsUncompressed.includes('69\\05484')).to.be.true
      expect(specificTermsUncompressed.includes('Jean)-200(Dupont')).to.be.true
      expect(specificTermsUncompressed.includes('jeandupont\\100email\\056com')).to.be.true
      expect(specificTermsUncompressed.includes('John)-200(Doe')).to.be.true
      expect(specificTermsUncompressed.includes('13)-200(rue)-200(du)-200(loup)-200(garou\\054)-200(91100)-200(Corbeil\\055Essonnes')).to.be.true
      expect(specificTermsUncompressed.includes('[_room_count]')).to.be.false
      expect(specificTermsUncompressed.includes('7)-200(000)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('150)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('3)-200(500)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('1)-200(400)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('12\\05707\\0572020')).to.be.true
    }).timeout(10000)

    it('should generate a new specific terms document (new CP template) with amount rounded to the nearest', async () => {
      // Given
      demoPartnerPolicy = createPolicyFixture({ partnerCode: 'demo' })
      demoPartnerPolicy.insurance.productCode = 'APP1234'
      demoPartnerPolicy.insurance.estimate.defaultCeiling = 7001

      // When
      demoPartnerSpecificTerms = await specificTermsPdfGenerator.generate(demoPartnerPolicy)

      // Then
      const specificTermsUncompressed = await pdftk.input(demoPartnerSpecificTerms.buffer).uncompress().output()
      expect(specificTermsUncompressed.includes('7)-200(001)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('3)-200(501)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('1)-200(400)-200(euros')).to.be.true
    }).timeout(10000)

    describe('For a partner which is not a demo partner', async () => {
      it('should not add specimen stamp on generated terms document', async () => {
        // Then
        const specificTermsUncompressed = await pdftk.input(specificTerms.buffer).uncompress().output()
        expect(specificTermsUncompressed.includes('SPECIMEN')).to.be.false
      }).timeout(10000)
    })

    describe('For a demo partners', async () => {
      it('should add specimen stamp on generated terms document', async () => {
        // Then
        const specificTermsUncompressed = await pdftk.input(demoStudentPartnerSpecificTerms.buffer).uncompress().output()
        expect(specificTermsUncompressed.includes('SPECIMEN')).to.be.true
      }).timeout(10000)
    })
  })

  describe('When not on production mode', () => {
    const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor({ productionMode: false })
    const specificTermsPdfGenerator : SpecificTermsPdfGenerator = new SpecificTermsPdfGenerator(pdfProcessor)

    let policy: Policy
    let demoPartnerPolicy: Policy
    let specificTerms: SpecificTerms
    let demoPartnerSpecificTerms: SpecificTerms
    before(async function () {
      this.timeout(10000)
      // Given
      dateFaker.setCurrentDate(new Date('2020-07-12T00:00:00.000Z'))
      policy = createPolicyFixture({ partnerCode: 'essca' })
      policy.termEndDate = dayjs(policy.termStartDate).add(1, 'month').toDate()
      policy.insurance.productCode = 'APP1234'

      demoPartnerPolicy = createPolicyFixture({ partnerCode: 'demo' })

      // When
      specificTerms = await specificTermsPdfGenerator.generate(policy)
      demoPartnerSpecificTerms = await specificTermsPdfGenerator.generate(demoPartnerPolicy)
    })

    it('should generate a new specific terms document', async () => {
      // Then
      const specificTermsUncompressed = await pdftk.input(specificTerms.buffer).uncompress().output()
      expect(specificTerms.name).to.equal('Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
      expect(specificTermsUncompressed.includes('\\300 EFFET DU 05\\05701\\0572020')).to.be.true
      expect(specificTermsUncompressed.includes('n\\260APP 753 210 859')).to.be.true
      expect(specificTermsUncompressed.includes('Votre contrat arrivera \\340 \\351ch\\351ance le 05\\05702\\0572020')).to.be.true
      expect(specificTermsUncompressed.includes('votre tarif est de 69\\05484 \\200')).to.be.true
      expect(specificTermsUncompressed.includes('Jean Dupont')).to.be.true
      expect(specificTermsUncompressed.includes('jeandupont\\100email\\056com')).to.be.true
      expect(specificTermsUncompressed.includes('John Doe')).to.be.true
      expect(specificTermsUncompressed.includes('13 rue du loup garou')).to.be.true
      expect(specificTermsUncompressed.includes('91100 Corbeil\\055Essonnes')).to.be.true
      expect(specificTermsUncompressed.includes('Votre logement est compos\\351 de 2 pi\\350ce\\(s\\) principale\\(s\\)')).to.be.true
      expect(specificTermsUncompressed.includes('valeur mobili\\350re par \\351v\\351nement : 7 000 \\200')).to.be.true
      expect(specificTermsUncompressed.includes('pour les autres garanties de protection de vos biens : 150 \\200')).to.be.true
      expect(specificTermsUncompressed.includes('Fait \\340 Paris, le 12\\05707\\0572020')).to.be.true
    }).timeout(10000)

    it('should generate a new specific terms document (new CP template)', async () => {
      // Then
      const specificTermsUncompressed = await pdftk.input(demoPartnerSpecificTerms.buffer).uncompress().output()
      expect(specificTerms.name).to.equal('Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
      expect(specificTermsUncompressed.includes('05\\05701\\0572020')).to.be.true
      expect(specificTermsUncompressed.includes('APP)-200(753)-200(210)-200(859')).to.be.true
      expect(specificTermsUncompressed.includes('69\\05484')).to.be.true
      expect(specificTermsUncompressed.includes('Jean)-200(Dupont')).to.be.true
      expect(specificTermsUncompressed.includes('jeandupont\\100email\\056com')).to.be.true
      expect(specificTermsUncompressed.includes('John)-200(Doe')).to.be.true
      expect(specificTermsUncompressed.includes('13)-200(rue)-200(du)-200(loup)-200(garou\\054)-200(91100)-200(Corbeil\\055Essonnes')).to.be.true
      /*
        INFO : due to the pdf format/encoding, we cannot find the sentence with the room_count so we check that its placeholder is no in the
        pdf anymore, which means it has been replaced.
      */
      expect(specificTermsUncompressed.includes('[_room_count]')).to.be.false
      expect(specificTermsUncompressed.includes('7)-200(000)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('150)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('3)-200(500)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('1)-200(400)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('12\\05707\\0572020')).to.be.true
    }).timeout(10000)

    it('should generate a new specific terms document (new CP template) with amount rounded to the nearest', async () => {
      // Given
      demoPartnerPolicy.insurance.estimate.defaultCeiling = 7001

      // When
      demoPartnerSpecificTerms = await specificTermsPdfGenerator.generate(demoPartnerPolicy)

      // Then
      const specificTermsUncompressed = await pdftk.input(demoPartnerSpecificTerms.buffer).uncompress().output()
      expect(specificTermsUncompressed.includes('7)-200(001)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('3)-200(501)-200(euros')).to.be.true
      expect(specificTermsUncompressed.includes('1)-200(400)-200(euros')).to.be.true
    }).timeout(10000)

    describe('For a partner which is not a demo partner', async () => {
      it('should add specimen stamp on generated terms document', async () => {
        // Then
        const specificTermsUncompressed = await pdftk.input(specificTerms.buffer).uncompress().output()
        expect(specificTermsUncompressed.includes('SPECIMEN')).to.be.true
      }).timeout(10000)
    })

    describe('For a demo partners', async () => {
      it('should add specimen stamp on generated terms document', async () => {
        // Given
        dateFaker.setCurrentDate(new Date('2020-07-12T00:00:00.000Z'))
        const policy: Policy = createPolicyFixture({ partnerCode: 'demo-student' })
        policy.termEndDate = dayjs(policy.termStartDate).add(1, 'month').toDate()
        policy.insurance.productCode = 'APP1234'

        // When
        const specificTerms = await specificTermsPdfGenerator.generate(policy)

        // Then
        const specificTermsUncompressed = await pdftk.input(specificTerms.buffer).uncompress().output()
        expect(specificTermsUncompressed.includes('SPECIMEN')).to.be.true
      }).timeout(10000)
    })
  })
})
