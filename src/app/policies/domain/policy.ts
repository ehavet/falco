import { Quote } from '../../quotes/domain/quote'
import { CreatePolicyQuery } from './create-policy-query'

export interface Policy {
    insurance: Quote.Insurance,
    risk: Policy.Risk
}

export namespace Policy {

    export interface Risk {
        property: Risk.Property,
        people: Risk.People,
    }

    export namespace Risk {
        export interface Property {
            roomCount: number,
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

    export function createRisk (quoteRisk: Quote.Risk, createPolicyQueryRisk: CreatePolicyQuery.Risk): Policy.Risk {
      return {
        property: {
          roomCount: quoteRisk.property.roomCount,
          address: createPolicyQueryRisk.property.address,
          postalCode: createPolicyQueryRisk.property.postalCode,
          city: createPolicyQueryRisk.property.city
        },
        people: createPolicyQueryRisk.people
      }
    }
}
