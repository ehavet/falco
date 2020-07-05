import { Quote } from '../../quotes/domain/quote'
import { CreatePolicyQuery } from './create-policy-query'

export interface Policy {
        insurance: Quote.Insurance,
        risk: Policy.Risk,
        contact: Policy.Contact
}

namespace Policy {
    export interface Risk {
        property: Risk.Property,
        people: Risk.People,
    }

    export interface Contact {
        lastname: string,
        firstname: string,
        address: string,
        postalCode: number,
        city: string,
        email: string,
        phoneNumber: string
    }
}

namespace Policy.Risk {
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
}

namespace Policy.Risk.People {
    export interface PolicyHolder {
        firstname: string,
        lastname: string
    }

    export interface Beneficiary {
        firstname: string,
        lastname: string
    }
}

export function createPolicy (createPolicyQuery: CreatePolicyQuery, quote: Quote): Policy {
  return {
    insurance: quote.insurance,
    risk: _createRisk(createPolicyQuery.risk, quote.risk),
    contact: _createContact(createPolicyQuery.contact, createPolicyQuery.risk)
  }
}

function _createRisk (queryRisk: CreatePolicyQuery.Risk, quoteRisk: Quote.Risk): Policy.Risk {
  return {
    property: {
      roomCount: quoteRisk.property.roomCount,
      address: queryRisk.property.address,
      postalCode: queryRisk.property.postalCode,
      city: queryRisk.property.city
    },
    people: queryRisk.people
  }
}

function _createContact (queryContact: CreatePolicyQuery.Contact, queryRisk: CreatePolicyQuery.Risk): Policy.Contact {
  return {
    lastname: queryRisk.people.policyHolder.lastname,
    firstname: queryRisk.people.policyHolder.firstname,
    address: queryRisk.property.address,
    postalCode: queryRisk.property.postalCode,
    city: queryRisk.property.city,
    email: queryContact.email,
    phoneNumber: queryContact.phoneNumber
  }
}
