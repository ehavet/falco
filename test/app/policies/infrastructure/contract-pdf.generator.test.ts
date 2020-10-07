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
  const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor()
  const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator(pdfProcessor)
  const contractPdfGenerator: ContractPdfGenerator = new ContractPdfGenerator(pdfProcessor)

  describe('#generate', async () => {
    describe('For non demo partners', async () => {
      it('should generate a new contract with signature page, specific terms and contractual terms with no specimen stamp on it', async () => {
        // Given
        await fsx.emptyDir(specificTermsFolderPath)
        const policy = createPolicyFixture({ partnerCode: 'essca' })
        policy.insurance.productCode = 'APP658'
        const specificTerms = await specificTermsGenerator.generate(policy)

        // When
        const subscriptionDocuments = await contractPdfGenerator.generate(policy.id, policy.insurance.productCode, 'partnerCode', specificTerms)

        // Then
        const subscriptionDocumentsPdfBuffer = await pdftk.input(subscriptionDocuments.buffer).uncompress().output()
        expect(subscriptionDocuments.name).to.equal('Appenin_Contrat_assurance_habitation_APP753210859.pdf')
        expect(subscriptionDocumentsPdfBuffer.includes('SPECIMEN')).to.be.false
        expect(subscriptionDocumentsPdfBuffer.includes('Par cette signature, j\\222accepte les termes du contrat')).to.be.true
        expect(subscriptionDocumentsPdfBuffer.includes('(P)87.9 (AR)49.3 (TICULI\\310RES)')).to.be.true
        expect(subscriptionDocumentsPdfBuffer.includes('CONDITIONS G\\311N\\311RALES')).to.be.true
        expect(subscriptionDocumentsPdfBuffer.includes(policy.insurance.productCode)).to.be.true
      }).timeout(10000)
    })

    describe('For non demo partners', async () => {
      it('should generate a new contract with signature page, specific terms and contractual terms with no specimen stamp on it', async () => {
        // Given
        await fsx.emptyDir(specificTermsFolderPath)
        const policy = createPolicyFixture({ partnerCode: 'demo-student' })
        const specificTerms = await specificTermsGenerator.generate(policy)

        // When
        const subscriptionDocuments = await contractPdfGenerator.generate(policy.id, policy.insurance.productCode, 'partnerCode', specificTerms)

        // Then
        const subscriptionDocumentsPdfBuffer = await pdftk.input(subscriptionDocuments.buffer).uncompress().output()
        expect(subscriptionDocumentsPdfBuffer.includes('SPECIMEN')).to.be.true
      }).timeout(10000)
    })
  })

  describe('#getContractName', () => {
    it('should return the contract file name for the given policy id', () => {
      // When
      const contractFileName = contractPdfGenerator.getContractName('APP111111111')

      // Then
      expect(contractFileName).to.equal('Appenin_Contrat_assurance_habitation_APP111111111.pdf')
    }).timeout(10000)
  })
})
