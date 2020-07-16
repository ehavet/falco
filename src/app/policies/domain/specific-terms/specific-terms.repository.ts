import { Policy } from '../policy'
import { SpecificTerms } from './specific-terms'

export interface SpecificTermsRepository {
    create(policy: Policy): Promise<SpecificTerms>
}
