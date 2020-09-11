import pdftk from 'node-pdftk'
import path from 'path'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import { ContractGenerator } from '../../domain/contract/contract.generator'

const SIGNATURE_PAGE_FILE_NAME = 'Appenin_Page_Signature_07_20.pdf'

export class ContractPdfGenerator implements ContractGenerator {
  async generate (policyId: string, productCode: string, specificTerms: SpecificTerms): Promise<any> {
    const contractName: string = this.getContractName(policyId)

    const [signaturePageBuffer, contractualTermsBuffer] = await Promise.all([
      this.readFile(SIGNATURE_PAGE_FILE_NAME),
      this.readFile(this.getContractualTermsFileName(productCode))
    ])

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

  private async readFile (filename: string): Promise<Buffer> {
    return await pdftk
      .input(path.join(__dirname, filename))
      .output()
  }
}
