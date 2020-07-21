import pdftk from 'node-pdftk'
import path from 'path'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import { ContractGenerator } from '../../domain/contract/contract.generator'

const CONTRACTUAL_TERMS_FILE_NAME = 'Appenin_Conditions_Generales_assurance_habitation_APP658.pdf'
const SIGNATURE_PAGE_FILE_NAME = 'Appenin_Page_Signature_07_20.pdf'

export class ContractPdfGenerator implements ContractGenerator {
  async generate (policyId: string, specificTerms: SpecificTerms): Promise<any> {
    const contractName: string = this.generateName(policyId)

    const [signaturePageBuffer, contractualTermsBuffer] = await Promise.all([
      this.readFile(SIGNATURE_PAGE_FILE_NAME),
      this.readFile(CONTRACTUAL_TERMS_FILE_NAME)
    ])

    const buffer = await pdftk
      .input({
        A: signaturePageBuffer,
        B: specificTerms.buffer,
        C: contractualTermsBuffer
      })
      .cat('A B C')
      .uncompress()
      .output()

    return { name: contractName, buffer }
  }

  private generateName (policyId: string): string {
    return `Appenin_Contrat_assurance_habitation_${policyId}.pdf`
  }

  private async readFile (filename: string): Promise<Buffer> {
    return await pdftk
      .input(path.join(__dirname, filename))
      .uncompress()
      .output()
  }
}