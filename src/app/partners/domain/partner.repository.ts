import { Partner } from './partner'
import { OperationalCode } from '../../pricing/domain/operational-code'

export interface PartnerRepository {
    getByCode(partnerCode: string): Promise<Partner>

    getOffer(partnerCode: string): Promise<Partner.Offer>

    getCallbackUrl(partnerCode: string): Promise<string>

    getOperationalCodes(partnerCode: string): Promise<Array<OperationalCode>>
}
