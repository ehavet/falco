import { PartnerInformation } from './partner-information'

export interface PartnerInformationRepository {
    getByName(name: string): PartnerInformation
}
