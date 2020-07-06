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
}

export namespace CreatePolicyCommand.Risk {
    export interface Property {
        address: string,
        postalCode: number,
        city: string
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
