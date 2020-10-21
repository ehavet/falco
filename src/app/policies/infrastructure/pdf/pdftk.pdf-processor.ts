import pdftk from 'node-pdftk'
import path from 'path'
import { PDFProcessor } from './pdf-processor'
import { PDFGenerationConfig } from '../../../../configs/pdf-generation.config'

const SPECIMEN_STAMP_FILENAME: string = 'specimen-stamp.pdf'
const DEMO_PARTNER_CODE_PREFIX: string = 'demo-'

export class PDFtkPDFProcessor implements PDFProcessor {
  #config: PDFGenerationConfig

  constructor (config: PDFGenerationConfig) {
    this.#config = config
  }

  public async readPdfFile (filePath: string, partnerCode: string): Promise<Buffer> {
    if (this.isRelatedToADemoPartner(partnerCode) || this.isNotInProductionMode()) {
      return this.readPdfFileAndAddSpecimenStamp(filePath)
    }
    return pdftk.input(filePath).uncompress().output()
  }

  public async formatPdfBufferProperly (pdfBuffer: Buffer): Promise<Buffer> {
    return pdftk.input(pdfBuffer).compress().output()
  }

  private isRelatedToADemoPartner (partnerCode: string) {
    return partnerCode.startsWith(DEMO_PARTNER_CODE_PREFIX)
  }

  private isNotInProductionMode (): boolean {
    return !this.#config.productionMode
  }

  private readPdfFileAndAddSpecimenStamp (filePath: string): Promise<Buffer> {
    return pdftk
      .input(filePath)
      .multiStamp(path.join(__dirname, SPECIMEN_STAMP_FILENAME))
      .uncompress().output()
  }
}
