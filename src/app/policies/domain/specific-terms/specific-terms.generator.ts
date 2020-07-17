import { Policy } from '../policy'
import { SpecificTerms } from './specific-terms'

export interface SpecificTermsGenerator {
    generate(policy: Policy): Promise<SpecificTerms>
    getNameFor(policyId: string): string
}
