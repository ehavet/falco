import { OperationCode } from '../../common-api/domain/operation-code'

export interface CreateQuoteCommand {
    partnerCode: string,
    specOpsCode: OperationCode
    risk: {
        property: {
            roomCount: number
        }
    }
}
