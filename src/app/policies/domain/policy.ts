import { Quote } from '../../quotes/domain/quote'
import { CreatePolicyCommand } from './create-policy-command'
import { generate } from 'randomstring'
import { PolicyRepository } from './policy.repository'

export interface Policy {
    id: string,
    partnerCode: string,
    insurance: Quote.Insurance,
    risk: Policy.Risk,
    contact: Policy.Contact
}

export namespace Policy {
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

    // @ts-ignore
    export async function createPolicy (createPolicyCommand: CreatePolicyCommand, quote: Quote, policyRepository: PolicyRepository): Policy {
      const generatedId = _generateId(createPolicyCommand.partnerCode)
      if (await policyRepository.isIdAvailable(generatedId)) {
        return {
          id: generatedId,
          partnerCode: createPolicyCommand.partnerCode,
          insurance: quote.insurance,
          risk: _createRisk(createPolicyCommand.risk, quote.risk),
          contact: _createContact(createPolicyCommand.contact, createPolicyCommand.risk)
        }
      }

      return createPolicy(createPolicyCommand, quote, policyRepository)
    }

    function _generateId (partnerCode: string): string {
      const prefix: string = partnerCode.substr(0, 3).toUpperCase()
      const suffix: string = generate({ length: 9, charset: 'numeric', readable: true })
      return `${prefix}${suffix}`
    }

    function _createRisk (queryRisk: CreatePolicyCommand.Risk, quoteRisk: Quote.Risk): Policy.Risk {
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

    function _createContact (queryContact: CreatePolicyCommand.Contact, queryRisk: CreatePolicyCommand.Risk): Policy.Contact {
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
}

export namespace Policy.Risk {
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

export namespace Policy.Risk.People {
    export interface PolicyHolder {
        firstname: string,
        lastname: string
    }

    export interface Beneficiary {
        firstname: string,
        lastname: string
    }
}
