import { OperationCode } from '../../common-api/domain/operation-code'
import { PropertyType } from '../../common-api/domain/type/property-type'
import { Occupancy } from '../../common-api/domain/type/occupancy'

export interface CreateQuoteCommand {
    partnerCode: string,
    risk: CreateQuoteCommand.Risk,
    policyHolder?: CreateQuoteCommand.PolicyHolder,
    startDate?: Date,
    specOpsCode?: OperationCode
}

export namespace CreateQuoteCommand {
    export interface Risk {
        property: Risk.Property,
        person?: Risk.Person
        otherPeople?: Array<Risk.Person>
    }

    export interface PolicyHolder {
        firstname?: string,
        lastname?: string,
        address?: string,
        postalCode?: string,
        city?: string,
        email?: string,
        phoneNumber?: string
    }
}

export namespace CreateQuoteCommand.Risk {
    export interface Property {
        roomCount: number,
        address?: string,
        postalCode?: string,
        city?: string
        type?: PropertyType,
        occupancy?: Occupancy
    }

    export interface Person {
        firstname: string,
        lastname: string
    }
}
