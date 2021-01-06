import { PropertyType } from '../../common-api/domain/common-type/property-type'

export interface UpdateQuoteCommand {
    id: string
    risk: UpdateQuoteCommand.Risk,
    policyHolder?: UpdateQuoteCommand.PolicyHolder,
    startDate?: Date,
    specOpsCode?: string
}

export namespace UpdateQuoteCommand {
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

export namespace UpdateQuoteCommand.Risk {
    export interface Property {
        roomCount: number,
        address?: string,
        postalCode?: string,
        city?: string
        type?: PropertyType
    }
}

export namespace UpdateQuoteCommand.Risk {
    export interface Person {
        firstname: string,
        lastname: string
    }
}
