import { SpecificTerms } from './specific-terms'

export interface SpecificTermsRepository {
    save(specificTerms: SpecificTerms, policyId: string): Promise<SpecificTerms>
    get(specificTermsName: string): Promise<SpecificTerms>
}
