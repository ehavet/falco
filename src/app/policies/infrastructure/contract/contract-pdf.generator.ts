import pdftk from 'node-pdftk'
import path from 'path'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import { ContractGenerator } from '../../domain/contract/contract.generator'
import { PDFProcessor } from '../pdf/pdf-processor'

const SIGNATURE_PAGE_FILE_NAME = 'Appenin_Page_Signature_07_20.pdf'

export class ContractPdfGenerator implements ContractGenerator {
  #pdfProcessor: PDFProcessor

  constructor (pdfProcessor: PDFProcessor) {
    this.#pdfProcessor = pdfProcessor
  }

  async generate (policyId: string, productCode: string, partnerCode: string, specificTerms: SpecificTerms): Promise<any> {
    const contractName: string = this.getContractName(policyId)

    const [signaturePageBuffer, contractualTermsBuffer] = await Promise.all([
      this.#pdfProcessor.readPdfFile(path.join(__dirname, SIGNATURE_PAGE_FILE_NAME), partnerCode),
      this.#pdfProcessor.readPdfFile(path.join(__dirname, this.getContractualTermsFileName(productCode)), partnerCode)
    ])

    // TODO migrate to PDFTkProcessor
    const buffer = await pdftk
      .input({
        A: signaturePageBuffer,
        B: specificTerms.buffer,
        C: contractualTermsBuffer
      })
      .cat('A B C')
      .output()

    return { name: contractName, buffer }
  }

  getContractName (policyId: string): string {
    return `Appenin_Contrat_assurance_habitation_${policyId}.pdf`
  }

  private getContractualTermsFileName (productCode: string): string {
    return `Appenin_Conditions_Generales_assurance_habitation_${productCode}.pdf`
  }
}
