import { Partner } from './partner'

export interface PartnerRepository {
    getByCode(partnerCode: string): Promise<Partner>

    getOffer(partnerCode: string): Promise<Partner.Offer>

    getCallbackUrl(partnerCode: string): Promise<string>
}
