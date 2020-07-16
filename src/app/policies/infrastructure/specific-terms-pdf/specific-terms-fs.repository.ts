import pdftk from 'node-pdftk'
import path from 'path'
import fs from 'fs'
import { SpecificTermsRepository } from '../../domain/specific-terms/specific-terms.repository'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import { Config } from '../../../../config'
import {
  SpecificTermsAlreadyCreatedError,
  SpecificTermsNotFoundError
} from '../../domain/specific-terms/specific-terms.errors'

export class SpecificTermsFSRepository implements SpecificTermsRepository {
  constructor (private config: Config) {}

  async get (specificTermsName: string): Promise<SpecificTerms> {
    const specificTermsFilePath: string = this.getSpecificTermsFilePath(specificTermsName)
    try {
      const buffer = await pdftk
        .input(specificTermsFilePath)
        .uncompress()
        .output()
      return { name: specificTermsName, buffer }
    } catch (error) {
      if (error === 'Error: Unable to find file.') {
        throw new SpecificTermsNotFoundError(specificTermsName)
      }
      throw error
    }
  }

  async save (specificTerms: SpecificTerms, policyId: string): Promise<SpecificTerms> {
    const specificTermsFilePath: string = this.getSpecificTermsFilePath(specificTerms.name)
    this.checkSpecificTermsNotAlreadyGenerated(specificTermsFilePath, policyId)
    await pdftk
      .input(specificTerms.buffer)
      .compress()
      .output(specificTermsFilePath)

    return specificTerms
  }

  private getSpecificTermsFilePath (specificTermsName: string) {
    return path.join(this.config.get('FALCO_API_SPECIFIC_TERMS_STORAGE_FOLDER'), specificTermsName)
  }

  private checkSpecificTermsNotAlreadyGenerated (specificTermsFilePath: string, policyId: string): void {
    if (fs.existsSync(specificTermsFilePath)) {
      throw new SpecificTermsAlreadyCreatedError(policyId)
    }
  }
}
