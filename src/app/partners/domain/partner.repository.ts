import { Partner } from './partner'
import { OperationCode } from '../../common-api/domain/operation-code'

export interface PartnerRepository {
    getByCode(partnerCode: string): Promise<Partner>

    getOffer(partnerCode: string): Promise<Partner.Offer>

    getCallbackUrl(partnerCode: string): Promise<string>

    getOperationCodes(partnerCode: string): Promise<Array<OperationCode>>
}
