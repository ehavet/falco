import { PropertyType } from '../../common-api/domain/type/property-type'

export interface CreatePolicyCommand {
    partnerCode: string,
    quoteId: string,
    risk: CreatePolicyCommand.Risk,
    contact: CreatePolicyCommand.Contact,
    startDate: Date | null
}

export namespace CreatePolicyCommand {
    export interface Risk {
        property: Risk.Property,
        people: Risk.People,
    }

    export interface Contact {
        email: string,
        phoneNumber: string
    }

    export function isRiskPropertyAddressMissing (command: CreatePolicyCommand): boolean {
      return !command.risk.property.address
    }

    export function isRiskPropertyPostalCodeMissing (command: CreatePolicyCommand): boolean {
      return !command.risk.property.postalCode
    }

    export function isRiskPropertyCityMissing (command: CreatePolicyCommand): boolean {
      return !command.risk.property.city
    }

    export function isRiskPropertyTypeMissing (command: CreatePolicyCommand): boolean {
      return !command.risk.property.type
    }
}

export namespace CreatePolicyCommand.Risk {
    export interface Property {
        address: string | undefined,
        postalCode: string | undefined,
        city: string | undefined,
        type: PropertyType | undefined
    }

    export interface People {
        policyHolder: People.PolicyHolder,
        otherInsured: Array<People.OtherInsured>
    }
}

export namespace CreatePolicyCommand.Risk.People {
    export interface PolicyHolder {
        firstname: string,
        lastname: string
    }

    export interface OtherInsured {
        firstname: string,
        lastname: string
    }
}
