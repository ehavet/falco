import { Partner } from './partner'
import { OperationCode } from '../../common-api/domain/operation-code'

export interface PartnerRepository {
    getByCode(partnerCode: string): Promise<Partner>

    getCallbackUrl(partnerCode: string): Promise<string>

    getOperationCodes(partnerCode: string): Promise<Array<OperationCode>>
}
