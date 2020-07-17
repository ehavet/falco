import pdftk from 'node-pdftk'
import path from 'path'
import fsx from 'fs-extra'
import { Config } from '../../../../config'
import { ContractRepository } from '../../domain/contract/contract.repository'
import { Contract } from '../../domain/contract/contract'

export class ContractFsRepository implements ContractRepository {
  private tempContractsFolderPath: string
  private signedContractsFolderPath: string

  constructor (private config: Config) {
    this.tempContractsFolderPath = path.join(this.config.get('FALCO_API_DOCUMENTS_STORAGE_FOLDER'), 'tmp')
    this.signedContractsFolderPath = this.config.get('FALCO_API_DOCUMENTS_STORAGE_FOLDER')
    fsx.ensureDirSync(this.tempContractsFolderPath)
  }

  async saveTempContract (contract: Contract): Promise<string> {
    const tempContractFilePath: string = this.getTempContractsFilePath(contract.name)
    await pdftk
      .input(contract.buffer)
      .compress()
      .output(tempContractFilePath)

    return tempContractFilePath
  }

  async saveSignedContract (contract: Contract): Promise<Contract> {
    const signedContractFilePath: string = this.getSignedContractsFilePath(contract.name)
    await pdftk
      .input(contract.buffer)
      .compress()
      .output(signedContractFilePath)

    return contract
  }

  private getTempContractsFilePath (contractName: string) {
    return path.join(this.tempContractsFolderPath, contractName)
  }

  private getSignedContractsFilePath (contractName: string) {
    return path.join(this.signedContractsFolderPath, contractName)
  }
}
