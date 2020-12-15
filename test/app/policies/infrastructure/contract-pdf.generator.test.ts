import fsx from 'fs-extra'
import pdftk from 'node-pdftk'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { config, expect } from '../../../test-utils'
import { ContractPdfGenerator } from '../../../../src/app/policies/infrastructure/contract/contract-pdf.generator'
import { SpecificTermsGenerator } from '../../../../src/app/policies/domain/specific-terms/specific-terms.generator'
import { SpecificTermsPdfGenerator } from '../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-pdf.generator'
import { PDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdf-processor'
import { PDFtkPDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdftk.pdf-processor'

describe('Policies - Infra - Contract PDF Generator', async () => {
  const specificTermsFolderPath: string = config.get('FALCO_API_DOCUMENTS_STORAGE_FOLDER')

  afterEach(async function () {
    this.timeout(10000)
    await fsx.emptyDir(specificTermsFolderPath)
  })

  describe('#generate', async () => {
    describe('When on production mode', () => {
      const pdfProcessorProd: PDFProcessor = new PDFtkPDFProcessor({ productionMode: true })
      const specificTermsGenerator = new SpecificTermsPdfGenerator(pdfProcessorProd)
      const contractPdfGenerator = new ContractPdfGenerator(pdfProcessorProd)
      let policy
      let demoPartnerPolicy
      let specificTerms
      let demoPartnerSpecificTerms
      let subscriptionDocuments

      before('generate certificate with different partners', async function () {
        this.timeout(10000)
        // Given
        policy = createPolicyFixture({ partnerCode: 'essca' })
        demoPartnerPolicy = createPolicyFixture({ partnerCode: 'demo-student' })

        policy.insurance.productCode = 'APP658'

        specificTerms = await specificTermsGenerator.generate(policy)
        demoPartnerSpecificTerms = await specificTermsGenerator.generate(demoPartnerPolicy)

        // When
        subscriptionDocuments = await contractPdfGenerator.generate(policy.id, policy.insurance.productCode, 'partnerCode', specificTerms)
      })

      it('should generate a new contract with signature page, specific terms and contractual terms', async () => {
        // Then
        const subscriptionDocumentsPdfBuffer = await pdftk.input(subscriptionDocuments.buffer).uncompress().output()
        expect(subscriptionDocuments.name).to.equal('Appenin_Contrat_assurance_habitation_APP753210859.pdf')
        expect(subscriptionDocumentsPdfBuffer.includes('Par cette signature, j\\222accepte les termes du contrat')).to.be.true
        expect(subscriptionDocumentsPdfBuffer.includes('(P)87.9 (AR)49.3 (TICULI\\310RES)')).to.be.true
        expect(subscriptionDocumentsPdfBuffer.includes('CONDITIONS G\\311N\\311RALES')).to.be.true
        expect(subscriptionDocumentsPdfBuffer.includes(policy.insurance.productCode)).to.be.true
      }).timeout(10000)

      describe('For a partner which is not a demo partner', () => {
        it('Should not add specimen stamp on generated contract', async () => {
          // Then
          const subscriptionDocumentsPdfBuffer = await pdftk.input(subscriptionDocuments.buffer).uncompress().output()
          expect(subscriptionDocumentsPdfBuffer.includes('SPECIMEN')).to.be.false
        }).timeout(10000)
      })

      describe('For a demo partner', () => {
        it('Should add specimen stamp on generated contract', async () => {
          // When
          const subscriptionDocuments = await contractPdfGenerator.generate(demoPartnerPolicy.id, demoPartnerPolicy.insurance.productCode, 'demo-student', demoPartnerSpecificTerms)

          // Then
          const subscriptionDocumentsPdfBuffer = await pdftk.input(subscriptionDocuments.buffer).uncompress().output()
          expect(subscriptionDocumentsPdfBuffer.includes('SPECIMEN')).to.be.true
        }).timeout(10000)
      })
    })

    describe('When not on production mode', () => {
      const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor({ productionMode: false })
      const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator(pdfProcessor)
      const contractPdfGenerator: ContractPdfGenerator = new ContractPdfGenerator(pdfProcessor)

      let policy
      let specificTerms
      let subscriptionDocuments
      before(async () => {
        // GIVEN
        policy = createPolicyFixture({ partnerCode: 'essca' })

        policy.insurance.productCode = 'APP658'

        specificTerms = await specificTermsGenerator.generate(policy)

        // WHEN
        subscriptionDocuments = await contractPdfGenerator.generate(policy.id, policy.insurance.productCode, 'partnerCode', specificTerms)
      })

      it('should generate a new contract with signature page, specific terms and contractual terms', async () => {
        // Then
        const subscriptionDocumentsPdfBuffer = await pdftk.input(subscriptionDocuments.buffer).uncompress().output()
        expect(subscriptionDocuments.name).to.equal('Appenin_Contrat_assurance_habitation_APP753210859.pdf')
        expect(subscriptionDocumentsPdfBuffer.includes('Par cette signature, j\\222accepte les termes du contrat')).to.be.true
        expect(subscriptionDocumentsPdfBuffer.includes('(P)87.9 (AR)49.3 (TICULI\\310RES)')).to.be.true
        expect(subscriptionDocumentsPdfBuffer.includes('CONDITIONS G\\311N\\311RALES')).to.be.true
        expect(subscriptionDocumentsPdfBuffer.includes(policy.insurance.productCode)).to.be.true
      }).timeout(10000)

      describe('For a partner which is not a demo partner', () => {
        it('Should add specimen stamp on generated contract', async () => {
          // Then
          const subscriptionDocumentsPdfBuffer = await pdftk.input(subscriptionDocuments.buffer).uncompress().output()
          expect(subscriptionDocumentsPdfBuffer.includes('SPECIMEN')).to.be.true
        }).timeout(10000)
      })

      describe('For a demo partners', async () => {
        it('Should add specimen stamp on generated contract', async () => {
          // Given
          const demoPartnerPolicy = createPolicyFixture({ partnerCode: 'demo-student' })
          const demoPartnerSpecificTerms = await specificTermsGenerator.generate(demoPartnerPolicy)

          // When
          const demoPartnerSubscriptionDocuments = await contractPdfGenerator.generate(policy.id, policy.insurance.productCode, 'partnerCode', demoPartnerSpecificTerms)

          // Then
          const subscriptionDocumentsPdfBuffer = await pdftk.input(demoPartnerSubscriptionDocuments.buffer).uncompress().output()
          expect(subscriptionDocumentsPdfBuffer.includes('SPECIMEN')).to.be.true
        }).timeout(10000)
      })
    })
  })

  describe('#getContractName', () => {
    it('should return the contract file name for the given policy id', () => {
      // Given
      const pdfProcessorProd: PDFProcessor = new PDFtkPDFProcessor({ productionMode: true })
      const contractPdfGenerator: ContractPdfGenerator = new ContractPdfGenerator(pdfProcessorProd)

      // When
      const contractFileName = contractPdfGenerator.getContractName('APP111111111')

      // Then
      expect(contractFileName).to.equal('Appenin_Contrat_assurance_habitation_APP111111111.pdf')
    }).timeout(10000)
  })
})
