import { OperationCode } from '../../common-api/domain/operation-code'
import { PropertyType } from '../../common-api/domain/type/property-type'
import { Occupancy } from '../../common-api/domain/type/occupancy'

export interface CreateQuoteCommand {
    partnerCode: string,
    specOpsCode: OperationCode
    risk: {
        property: {
            roomCount: number,
            address?: string,
            postalCode?: string,
            city?: string,
            type?: PropertyType,
            occupancy?: Occupancy
        }
    }
}
