export interface CreatePolicyQuery {
    quoteId: string,
    risk: CreatePolicyQuery.Risk,
}

export namespace CreatePolicyQuery {
    export interface Risk {
        property: Risk.Property,
        people: Risk.People,
    }

    export namespace Risk {
        export interface Property {
            address: string,
            postalCode: number,
            city: string
        }

        export interface People {
            policyHolder: People.PolicyHolder,
            otherBeneficiaries: Array<People.Beneficiary>
        }

        export namespace People {
            export interface PolicyHolder {
                firstname: string,
                lastname: string
            }

            export interface Beneficiary {
                firstname: string,
                lastname: string
            }
        }
    }
}
