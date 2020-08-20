import { Quote } from '../../quotes/domain/quote'
import { CreatePolicyCommand } from './create-policy-command'
import { generate } from 'randomstring'
import { PolicyRepository } from './policy.repository'
import dayjs from 'dayjs'
import { CannotGeneratePolicyNotApplicableError } from './certificate/certificate.errors'
import { Partner } from '../../partners/domain/partner'
import * as PartnerFunc from '../../partners/domain/partner.func'
import { PolicyStartDateConsistencyError, RoommatesNotAllowedError, NumberOfRoommatesError } from './policies.errors'

const DEFAULT_NUMBER_OF_MONTHS_DUE = 12

export interface Policy {
    id: string,
    partnerCode: string,
    insurance: Quote.Insurance,
    risk: Policy.Risk,
    contact: Policy.Contact,
    premium: number,
    nbMonthsDue: number,
    startDate: Date,
    termStartDate: Date,
    termEndDate: Date,
    signatureDate?: Date,
    paymentDate?: Date,
    subscriptionDate?: Date,
    emailValidationDate?: Date,
    readonly status: Policy.Status
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

    export enum Status {
        Initiated = 'INITIATED',
        Signed = 'SIGNED',
        Paid = 'PAID',
        Applicable = 'APPLICABLE'
    }

    export function emailNotValidatedYet (policy: Policy): boolean {
      return policy.emailValidationDate === undefined || policy.emailValidationDate === null
    }

    export function checkCanGenerateCertificate (policy: Policy): void {
      if (Policy.Status.Applicable !== policy.status) {
        throw new CannotGeneratePolicyNotApplicableError()
      }
    }

    export function isSigned (policy: Policy): boolean {
      return policy.status === Policy.Status.Signed ||
            policy.status === Policy.Status.Paid ||
            policy.status === Policy.Status.Applicable
    }

    export function applyNbMonthsDue (policy: Policy, nbMonthsDue: number): void {
      policy.premium = nbMonthsDue * policy.insurance.estimate.monthlyPrice
      policy.nbMonthsDue = nbMonthsDue
      policy.termEndDate = _computeTermEndDate(policy.startDate, nbMonthsDue)
    }

    export function applyStartDate (policy: Policy, startDate: Date): void {
      const currentDate: Date = new Date()
      currentDate.setHours(0, 0, 0, 0)
      if (dayjs(startDate).isBefore(dayjs(currentDate))) throw new PolicyStartDateConsistencyError()
      policy.startDate = startDate
      policy.termStartDate = startDate
      policy.termEndDate = _computeTermEndDate(startDate, policy.nbMonthsDue)
    }

    function _computeTermEndDate (termStartDate: Date, durationInMonths: number): Date {
      return dayjs(termStartDate).add(durationInMonths, 'month').subtract(1, 'day').toDate()
    }

    export async function
    create (createPolicyCommand: CreatePolicyCommand, quote: Quote, policyRepository: PolicyRepository, partner: Partner): Promise<Policy> {
      const partnerCode: string = createPolicyCommand.partnerCode
      const productCode: string = PartnerFunc.getProductCode(partner)
      const generatedId: string = _generateId(partnerCode, productCode)
      if (await policyRepository.isIdAvailable(generatedId)) {
        // eslint-disable-next-line no-use-before-define
        const risk = Risk.createRisk(createPolicyCommand.risk, quote.risk, partner)
        const startDate: Date = _getStartDate(createPolicyCommand)
        return {
          id: generatedId,
          partnerCode: createPolicyCommand.partnerCode,
          insurance: quote.insurance,
          risk,
          contact: _createContact(createPolicyCommand.contact, createPolicyCommand.risk),
          nbMonthsDue: DEFAULT_NUMBER_OF_MONTHS_DUE,
          premium: DEFAULT_NUMBER_OF_MONTHS_DUE * quote.insurance.estimate.monthlyPrice,
          startDate,
          termStartDate: startDate,
          termEndDate: _computeTermEndDate(startDate, DEFAULT_NUMBER_OF_MONTHS_DUE),
          signatureDate: undefined,
          paymentDate: undefined,
          subscriptionDate: undefined,
          emailValidationDate: undefined,
          status: Policy.Status.Initiated
        }
      }

      return create(createPolicyCommand, quote, policyRepository, partner)
    }

    function _generateId (partnerCode: string, productCode: string): string {
      const partner: string = partnerCode.substr(0, 3).toUpperCase()
      const product: string = productCode.replace(/[^0-9]/g, '')
      const random: string = generate({ length: 6, charset: 'numeric', readable: true })
      return `${partner}${product}${random}`
    }

    function _getStartDate (createPolicyCommand: CreatePolicyCommand): Date {
      return createPolicyCommand.startDate || new Date()
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
        otherInsured: Array<People.OtherInsured>
    }

    export function createRisk (commandRisk: CreatePolicyCommand.Risk, quoteRisk: Quote.Risk, partner: Partner): Policy.Risk {
      if (_hasRoommates(commandRisk)) {
        if (!PartnerFunc.doesPartnerAllowRoommates(partner)) {
          throw new RoommatesNotAllowedError(partner.code)
        }

        const numberOfRoommates: number = commandRisk.people.otherInsured?.length
        if (!PartnerFunc.doesPartnerAllowThisNumberOfRoommates(partner, numberOfRoommates, quoteRisk)) {
          throw new NumberOfRoommatesError(numberOfRoommates, quoteRisk.property.roomCount)
        }
      }

      return {
        property: {
          roomCount: quoteRisk.property.roomCount,
          address: commandRisk.property.address,
          postalCode: commandRisk.property.postalCode,
          city: commandRisk.property.city
        },
        people: commandRisk.people
      }
    }

    function _hasRoommates (commandRisk: CreatePolicyCommand.Risk) {
      return commandRisk.people.otherInsured?.length > 0
    }
}

export namespace Policy.Risk.People {
    export interface PolicyHolder {
        firstname: string,
        lastname: string
    }

    export interface OtherInsured {
        firstname: string,
        lastname: string
    }
}
