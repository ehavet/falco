import pdftk from 'node-pdftk'
import path from 'path'
import { SpecificTermsRepository } from '../../domain/specific-terms/specific-terms.repository'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import { Config } from '../../../../config'
import {
  SpecificTermsNotFoundError
} from '../../domain/specific-terms/specific-terms.errors'

export class SpecificTermsFSRepository implements SpecificTermsRepository {
  constructor (private config: Config) {}

  async get (specificTermsName: string): Promise<SpecificTerms> {
    const specificTermsFilePath: string = this.getSpecificTermsFilePath(specificTermsName)
    try {
      // TODO migrate to PDFTkProcessor
      const buffer = await pdftk
        .input(specificTermsFilePath)
        .output()
      return { name: specificTermsName, buffer }
    } catch (error) {
      if (error.includes('Error: Unable to find file.')) {
        throw new SpecificTermsNotFoundError(specificTermsName)
      }
      throw error
    }
  }

  async save (specificTerms: SpecificTerms): Promise<SpecificTerms> {
    const specificTermsFilePath: string = this.getSpecificTermsFilePath(specificTerms.name)
    // TODO migrate to PDFTkProcessor
    await pdftk
      .input(specificTerms.buffer)
      .compress()
      .output(specificTermsFilePath)

    return specificTerms
  }

  private getSpecificTermsFilePath (specificTermsName: string) {
    return path.join(this.config.get('FALCO_API_DOCUMENTS_STORAGE_FOLDER'), specificTermsName)
  }
}
