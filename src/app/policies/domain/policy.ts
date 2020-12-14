import { Quote } from '../../quotes/domain/quote'
import { CreatePolicyCommand } from './create-policy-command'
import { generate } from 'randomstring'
import { PolicyRepository } from './policy.repository'
import dayjs from '../../../libs/dayjs'
import { Partner } from '../../partners/domain/partner'
import * as PartnerFunc from '../../partners/domain/partner.func'
import { OperationCode } from '../../common-api/domain/operation-code'
import {
  PolicyStartDateConsistencyError,
  PolicyRiskRoommatesNotAllowedError,
  PolicyRiskNumberOfRoommatesError,
  PolicyHolderMissingError,
  PolicyRiskPersonMissingError,
  PolicyHolderMissingPropertyError,
  PolicyHolderEmailValidationError,
  PolicyRiskPropertyMissingFieldError
} from './policies.errors'
import { Amount } from '../../common-api/domain/amount/amount'

const DEFAULT_NUMBER_OF_MONTHS_DUE = 12

export interface Policy {
    id: string,
    partnerCode: string,
    insurance: Quote.Insurance,
    risk: Policy.Risk,
    contact: Policy.Holder,
    premium: Amount,
    nbMonthsDue: number,
    startDate: Date,
    termStartDate: Date,
    termEndDate: Date,
    signatureDate?: Date,
    paymentDate?: Date,
    subscriptionDate?: Date,
    emailValidationDate?: Date,
    specialOperationsCode: OperationCode | null
    specialOperationsCodeAppliedAt: Date | null
    readonly status: Policy.Status
}

export namespace Policy {
    export interface Risk {
        property: Risk.Property,
        people: Risk.People,
    }

    export interface Holder {
        lastname: string,
        firstname: string,
        address: string,
        postalCode: string,
        city: string,
        email: string,
        phoneNumber: string
    }

    export enum Status {
        Initiated = 'INITIATED',
        Signed = 'SIGNED',
        Paid = 'PAID',
        Applicable = 'APPLICABLE',
        Cancelled = 'CANCELLED'
    }

    export function isEmailNotValidated (policy: Policy): boolean {
      return policy.emailValidationDate === undefined || policy.emailValidationDate === null
    }

    export function isSigned (policy: Policy): boolean {
      return policy.status === Policy.Status.Signed ||
            policy.status === Policy.Status.Paid ||
            policy.status === Policy.Status.Applicable
    }

    export function isCancelled (policy: Policy): boolean {
      return policy.status === Policy.Status.Cancelled
    }

    export function applySpecialOperationsCode (policy: Policy, specialOperationsCode: OperationCode): void {
      switch (specialOperationsCode) {
        case OperationCode.SEMESTER1:
          _applyNbMonthsDue(policy, 5)
          _setSpecialOperationsCodeAndApplicationDate(policy, OperationCode.SEMESTER1)
          break
        case OperationCode.SEMESTER2:
          _applyNbMonthsDue(policy, 5)
          _setSpecialOperationsCodeAndApplicationDate(policy, OperationCode.SEMESTER2)
          break
        case OperationCode.FULLYEAR:
          _applyNbMonthsDue(policy, 10)
          _setSpecialOperationsCodeAndApplicationDate(policy, OperationCode.FULLYEAR)
          break
        case OperationCode.BLANK:
          _applyNbMonthsDue(policy, 12)
          _setSpecialOperationsCodeAndApplicationDate(policy)
      }
    }

    export function applyStartDate (policy: Policy, startDate: Date): void {
      const currentDate: Date = new Date()
      currentDate.setHours(0, 0, 0, 0)
      if (dayjs(startDate).isBefore(dayjs(currentDate))) throw new PolicyStartDateConsistencyError()
      policy.startDate = startDate
      policy.termStartDate = startDate
      policy.termEndDate = _computeTermEndDate(startDate, policy.nbMonthsDue)
    }

    export function getProductCode (policy: Policy): string {
      return policy.insurance.productCode
    }

    export function getPartnerCode (policy: Policy): string {
      return policy.partnerCode
    }

    export async function create (createPolicyCommand: CreatePolicyCommand, quote: Quote, policyRepository: PolicyRepository, partner: Partner): Promise<Policy> {
      const partnerTrigram: string = PartnerFunc.getTrigram(partner)
      const productCode: string = PartnerFunc.getProductCode(partner)
      const generatedId: string = generateId(partnerTrigram, productCode)
      if (await policyRepository.isIdAvailable(generatedId)) {
        if (_addressIsMissingFromQuoteAndCommand(quote, createPolicyCommand)) throw new PolicyRiskPropertyMissingFieldError(quote.id, 'address')
        if (_postalCodeIsMissingFromQuoteAndCommand(quote, createPolicyCommand)) throw new PolicyRiskPropertyMissingFieldError(quote.id, 'postalCode')
        if (_cityIsMissingFromQuoteAndCommand(quote, createPolicyCommand)) throw new PolicyRiskPropertyMissingFieldError(quote.id, 'city')

        // eslint-disable-next-line no-use-before-define
        const risk = Risk.createRisk(createPolicyCommand.risk, quote.risk, partner)
        const startDate: Date = _getStartDate(createPolicyCommand)
        return {
          id: generatedId,
          partnerCode: createPolicyCommand.partnerCode,
          insurance: quote.insurance,
          risk,
          contact: _createContact(createPolicyCommand.contact, createPolicyCommand.risk, quote.risk),
          nbMonthsDue: DEFAULT_NUMBER_OF_MONTHS_DUE,
          premium: Amount.multiply(quote.insurance.estimate.monthlyPrice, DEFAULT_NUMBER_OF_MONTHS_DUE),
          startDate,
          termStartDate: startDate,
          termEndDate: _computeTermEndDate(startDate, DEFAULT_NUMBER_OF_MONTHS_DUE),
          signatureDate: undefined,
          paymentDate: undefined,
          subscriptionDate: undefined,
          emailValidationDate: undefined,
          status: Policy.Status.Initiated,
          specialOperationsCode: null,
          specialOperationsCodeAppliedAt: null
        }
      }

      return create(createPolicyCommand, quote, policyRepository, partner)
    }

    export async function createFromQuote (policyId: string, quote: Quote): Promise<Policy> {
      _checkQuoteConsistencyToCreatePolicy(quote)

      return {
        id: policyId,
        partnerCode: quote.partnerCode,
        insurance: quote.insurance,
        // eslint-disable-next-line no-use-before-define
        risk: Risk.createFromQuoteRisk(quote.risk),
        contact: _createHolderFromQuotePolicyHolder(quote.policyHolder!),
        nbMonthsDue: quote.nbMonthsDue,
        premium: quote.premium,
        startDate: quote.startDate!,
        termStartDate: quote.termStartDate!,
        termEndDate: quote.termEndDate!,
        signatureDate: undefined,
        paymentDate: undefined,
        subscriptionDate: undefined,
        emailValidationDate: quote.policyHolder!.emailValidatedAt,
        status: Policy.Status.Initiated,
        specialOperationsCode: quote.specialOperationsCode!,
        specialOperationsCodeAppliedAt: quote.specialOperationsCodeAppliedAt!
      }
    }

    export function generateId (partnerTrigram: string, productCode: string): string {
      const partner: string = partnerTrigram.toUpperCase()
      const product: string = productCode.replace(/[^0-9]/g, '')
      const random: string = generate({ length: 6, charset: 'numeric', readable: true })
      return `${partner}${product}${random}`
    }
}

function _checkQuoteConsistencyToCreatePolicy (quote: Quote): void {
  if (Quote.isEmptyPolicyHolder(quote)) { throw new PolicyHolderMissingError(quote.id) }
  if (Quote.isEmptyRiskPerson(quote)) { throw new PolicyRiskPersonMissingError(quote.id) }
  if (Quote.isPolicyHolderEmailMissing(quote)) { throw new PolicyHolderMissingPropertyError(quote.id, 'email') }
  if (Quote.isPolicyHolderPhoneNumberMissing(quote)) { throw new PolicyHolderMissingPropertyError(quote.id, 'phoneNumber') }
  if (Quote.isPolicyHolderEmailNotValidated(quote)) { throw new PolicyHolderEmailValidationError(quote.id) }
  if (Quote.isPolicyRiskPropertyAddressMissing(quote)) { throw new PolicyRiskPropertyMissingFieldError(quote.id, 'address') }
  if (Quote.isPolicyRiskPropertyPostalCodeMissing(quote)) { throw new PolicyRiskPropertyMissingFieldError(quote.id, 'postalCode') }
  if (Quote.isPolicyRiskPropertyCityMissing(quote)) { throw new PolicyRiskPropertyMissingFieldError(quote.id, 'city') }
}

function _getStartDate (createPolicyCommand: CreatePolicyCommand): Date {
  return createPolicyCommand.startDate || new Date()
}

function _createContact (queryContact: CreatePolicyCommand.Contact, queryRisk: CreatePolicyCommand.Risk, quoteRisk: Quote.Risk): Policy.Holder {
  return {
    lastname: queryRisk.people.policyHolder.lastname,
    firstname: queryRisk.people.policyHolder.firstname,
    address: quoteRisk.property.address || queryRisk.property.address!,
    postalCode: quoteRisk.property.postalCode ? quoteRisk.property.postalCode : queryRisk.property.postalCode!,
    city: quoteRisk.property.city || queryRisk.property.city!,
    email: queryContact.email,
    phoneNumber: queryContact.phoneNumber
  }
}

function _computeTermEndDate (termStartDate: Date, durationInMonths: number): Date {
  return dayjs(termStartDate).add(durationInMonths, 'month').subtract(1, 'day').toDate()
}

function _applyNbMonthsDue (policy: Policy, nbMonthsDue: number): void {
  policy.premium = Amount.multiply(nbMonthsDue, policy.insurance.estimate.monthlyPrice)
  policy.nbMonthsDue = nbMonthsDue
  policy.termEndDate = _computeTermEndDate(policy.startDate, nbMonthsDue)
}

function _createHolderFromQuotePolicyHolder (quotePolicyHolder: Quote.PolicyHolder): Policy.Holder {
  return {
    lastname: quotePolicyHolder.lastname!,
    firstname: quotePolicyHolder.firstname!,
    address: quotePolicyHolder.address!,
    postalCode: quotePolicyHolder.postalCode!,
    city: quotePolicyHolder.city!,
    email: quotePolicyHolder.email!,
    phoneNumber: quotePolicyHolder.phoneNumber!
  }
}

function _setSpecialOperationsCodeAndApplicationDate (policy: Policy, specialOperationsCode: OperationCode | null = null): void {
  policy.specialOperationsCode = specialOperationsCode
  policy.specialOperationsCodeAppliedAt = specialOperationsCode ? new Date() : null
}

function _addressIsMissingFromQuoteAndCommand (quote: Quote, createPolicyCommand: CreatePolicyCommand): boolean {
  return (Quote.isPolicyRiskPropertyAddressMissing(quote) && CreatePolicyCommand.isRiskPropertyAddressMissing(createPolicyCommand))
}

function _postalCodeIsMissingFromQuoteAndCommand (quote: Quote, createPolicyCommand: CreatePolicyCommand): boolean {
  return (Quote.isPolicyRiskPropertyPostalCodeMissing(quote) && CreatePolicyCommand.isRiskPropertyPostalCodeMissing(createPolicyCommand))
}

function _cityIsMissingFromQuoteAndCommand (quote: Quote, createPolicyCommand: CreatePolicyCommand): boolean {
  return (Quote.isPolicyRiskPropertyCityMissing(quote) && CreatePolicyCommand.isRiskPropertyCityMissing(createPolicyCommand))
}

export namespace Policy.Risk {
    export interface Property {
        roomCount: number,
        address: string,
        postalCode: string,
        city: string
    }

    export interface People {
        person: People.Person,
        otherPeople: Array<People.OtherPeople>
    }

    export function createRisk (commandRisk: CreatePolicyCommand.Risk, quoteRisk: Quote.Risk, partner: Partner): Policy.Risk {
      if (_hasRoommates(commandRisk)) {
        if (!PartnerFunc.doesPartnerAllowRoommates(partner)) {
          throw new PolicyRiskRoommatesNotAllowedError()
        }

        const numberOfRoommates: number = commandRisk.people.otherInsured?.length
        if (!PartnerFunc.doesPartnerAllowNumberOfRoommatesForProperty(partner, numberOfRoommates, quoteRisk)) {
          throw new PolicyRiskNumberOfRoommatesError(PartnerFunc.getMaxNumberOfRoommatesForProperty(partner, quoteRisk), quoteRisk.property.roomCount)
        }
      }

      const postalCode = quoteRisk.property.postalCode
        ? quoteRisk.property.postalCode
        : commandRisk.property.postalCode!

      return {
        property: {
          roomCount: quoteRisk.property.roomCount,
          address: quoteRisk.property.address || commandRisk.property.address as string,
          postalCode,
          city: quoteRisk.property.city || commandRisk.property.city as string
        },
        people: {
          person: commandRisk.people.policyHolder,
          otherPeople: commandRisk.people.otherInsured
        }
      }
    }

    function _hasRoommates (commandRisk: CreatePolicyCommand.Risk): boolean {
      return commandRisk.people.otherInsured?.length > 0
    }

    export function createFromQuoteRisk (quoteRisk: Quote.Risk): Policy.Risk {
      return {
        property: {
          roomCount: quoteRisk.property.roomCount,
          address: quoteRisk.property.address!,
          postalCode: quoteRisk.property.postalCode!,
          city: quoteRisk.property.city!
        },
        people: {
          person: quoteRisk.person!,
          otherPeople: quoteRisk.otherPeople!
        }
      }
    }
}

export namespace Policy.Risk.People {
    export interface Person {
        firstname: string,
        lastname: string
    }

    export interface OtherPeople {
        firstname: string,
        lastname: string
    }
}
