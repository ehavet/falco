import { Quote } from '../../quotes/domain/quote'
import { CreatePolicyCommand } from './create-policy-command'
import { generate } from 'randomstring'
import { PolicyRepository } from './policy.repository'
import dayjs from 'dayjs'

const DEFAULT_NUMBER_OF_MONTHS_DUE = 12

export interface Policy {
    id: string,
    partnerCode: string,
    insurance: Quote.Insurance,
    risk: Policy.Risk,
    contact: Policy.Contact,
    premium: number,
    nbMonthsDue: number,
    subscriptionDate: Date,
    startDate: Date,
    termStartDate: Date,
    termEndDate: Date,
    signatureDate: Date | null,
    paymentDate: Date | null
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

    export async function createPolicy (createPolicyCommand: CreatePolicyCommand, quote: Quote, policyRepository: PolicyRepository): Promise<Policy> {
      const generatedId = _generateId(createPolicyCommand.partnerCode)
      if (await policyRepository.isIdAvailable(generatedId)) {
        const now = new Date()
        return {
          id: generatedId,
          partnerCode: createPolicyCommand.partnerCode,
          insurance: quote.insurance,
          risk: _createRisk(createPolicyCommand.risk, quote.risk),
          contact: _createContact(createPolicyCommand.contact, createPolicyCommand.risk),
          subscriptionDate: now,
          startDate: now,
          termStartDate: now,
          termEndDate: dayjs().add(1, 'year').subtract(1, 'day').toDate(),
          signatureDate: null,
          paymentDate: null,
          nbMonthsDue: DEFAULT_NUMBER_OF_MONTHS_DUE,
          premium: DEFAULT_NUMBER_OF_MONTHS_DUE * quote.insurance.estimate.monthlyPrice
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
