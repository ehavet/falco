import pdftk from 'node-pdftk'
import path from 'path'
import fsx from 'fs-extra'
import { Config } from '../../../../config'
import { ContractRepository } from '../../domain/contract/contract.repository'
import { Contract } from '../../domain/contract/contract'

export class ContractFsRepository implements ContractRepository {
  private contractTempFolderPath: string

  constructor (private config: Config) {
    this.contractTempFolderPath = path.join(this.config.get('FALCO_API_DOCUMENTS_STORAGE_FOLDER'), 'tmp')
    fsx.ensureDirSync(this.contractTempFolderPath)
  }

  async saveTempContract (contract: Contract): Promise<string> {
    const specificTermsFilePath: string = this.getContractTempFilePath(contract.name)
    await pdftk
      .input(contract.buffer)
      .compress()
      .output(specificTermsFilePath)

    return specificTermsFilePath
  }

  private getContractTempFilePath (specificTermsName: string) {
    return path.join(this.contractTempFolderPath, specificTermsName)
  }
}
