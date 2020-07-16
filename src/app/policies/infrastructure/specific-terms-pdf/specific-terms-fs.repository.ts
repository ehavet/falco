import pdftk from 'node-pdftk'
import path from 'path'
import fs from 'fs'
import { SpecificTermsRepository } from '../../domain/specific-terms/specific-terms.repository'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import { Config } from '../../../../config'
import { SpecificTermsAlreadyCreatedError } from '../../domain/specific-terms/specific-terms.errors'

export class SpecificTermsFSRepository implements SpecificTermsRepository {
  constructor (private config: Config) {}

  async save (specificTerms: SpecificTerms, policyId: string): Promise<SpecificTerms> {
    const specificTermsFilePath: string = path.join(this.config.get('FALCO_API_SPECIFIC_TERMS_STORAGE_FOLDER'), specificTerms.name)
    this.checkSpecificTermsNotAlreadyGenerated(specificTermsFilePath, policyId)
    await this.saveSpecificTerms(specificTerms.buffer, specificTermsFilePath)

    return specificTerms
  }

  private checkSpecificTermsNotAlreadyGenerated (specificTermsFilePath: string, policyId: string): void {
    if (fs.existsSync(specificTermsFilePath)) {
      throw new SpecificTermsAlreadyCreatedError(policyId)
    }
  }

  private async saveSpecificTerms (buffer, specificTermsFilePath: string) {
    await pdftk
      .input(buffer)
      .compress()
      .output(specificTermsFilePath)
  }
}
