import { Contract } from './contract'

export interface ContractRepository {
    saveTempContract(contract: Contract): Promise<string>
    saveSignedContract (contract: Contract): Promise<Contract>
}
