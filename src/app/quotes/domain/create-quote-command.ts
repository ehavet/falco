import { OperationCode } from '../../common-api/domain/operation-code'
import { PropertyType } from '../../common-api/domain/type/property-type'

export interface CreateQuoteCommand {
    partnerCode: string,
    specOpsCode: OperationCode
    risk: {
        property: {
            roomCount: number,
            address?: string,
            postalCode?: string,
            city?: string,
            type?: PropertyType
        }
    }
}
