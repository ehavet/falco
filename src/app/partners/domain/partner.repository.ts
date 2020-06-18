import { Partner } from './partner'

export interface PartnerRepository {
    getByCode(partnerCode: string): Promise<Partner>
}
