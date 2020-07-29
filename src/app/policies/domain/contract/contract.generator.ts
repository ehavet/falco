import { SpecificTerms } from '../specific-terms/specific-terms'
import { Contract } from './contract'

export interface ContractGenerator {
    generate (policyId: string, specificTerms: SpecificTerms): Promise<Contract>
    getContractName (policyId: string): string
}
