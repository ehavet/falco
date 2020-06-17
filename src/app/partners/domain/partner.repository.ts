import { Partner } from './partner'

export interface PartnerRepository {
    getByKey(partnerKey: string): Promise<Partner>
}
