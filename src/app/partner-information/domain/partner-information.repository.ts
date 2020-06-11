import { PartnerInformation } from './partner-information'

export interface PartnerInformationRepository {
    getByKey(partnerKey: string): Promise<PartnerInformation>
}
