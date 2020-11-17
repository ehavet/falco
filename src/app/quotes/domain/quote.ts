import { Partner } from '../../partners/domain/partner'
import { QuoteRiskPropertyRoomCountNotInsurableError, QuoteRiskNumberOfRoommatesError, QuoteRiskRoommatesNotAllowedError, QuoteStartDateConsistencyError } from './quote.errors'
import { generate } from 'randomstring'
import { UpdateQuoteCommand } from './update-quote-command'
import dayjs from '../../../libs/dayjs'
import * as PartnerFunc from '../../partners/domain/partner.func'
import { OperationCode } from '../../common-api/domain/operation-code'
import { OperationCodeNotApplicableError } from '../../policies/domain/operation-code.errors'
import { SpecialOperation } from '../../common-api/domain/special-operation.func'
import { CreateQuoteCommand } from './create-quote-command'

const DEFAULT_NUMBER_MONTHS_DUE = 12

export interface Quote {
    id: string,
    partnerCode: string,
    specialOperationsCode?: string,
    specialOperationsCodeAppliedAt?: Date
    risk: Quote.Risk,
    insurance: Quote.Insurance
    policyHolder?: Quote.PolicyHolder,
    premium: number,
    nbMonthsDue: number,
    startDate?: Date,
    termStartDate?: Date,
    termEndDate?: Date
}

export namespace Quote {

    export interface Risk {
        property: Risk.Property,
        person?: Risk.Person
        otherPeople?: Array<Risk.Person>
    }

    export interface Insurance {
        estimate: Insurance.Estimate
        currency: string,
        simplifiedCovers: Array<Insurance.SimplifiedCover>,
        productCode: string,
        productVersion: string,
        contractualTerms: string,
        ipid: string
    }

    export interface PolicyHolder {
        firstname?: string,
        lastname?: string,
        address?: string,
        postalCode?: string,
        city?: string,
        email?: string,
        phoneNumber?: string,
        emailValidatedAt?: Date
    }

    export function create (command: CreateQuoteCommand, partnerOffer: Partner.Offer): Quote {
      const insurance: Insurance = getInsurance(command.risk, partnerOffer)

      const nbMonthsDue = DEFAULT_NUMBER_MONTHS_DUE

      const quote = {
        id: nextId(),
        partnerCode: command.partnerCode,
        risk: command.risk,
        insurance: insurance,
        specialOperationsCode: undefined,
        specialOperationsCodeAppliedAt: undefined,
        nbMonthsDue: nbMonthsDue,
        premium: nbMonthsDue * insurance.estimate.monthlyPrice
      }

      _applyOperationCode(quote, partnerOffer.operationCodes, command.specOpsCode)

      return quote
    }

    export function update (quote: Quote, partner: Partner, command: UpdateQuoteCommand, partnerAvailableCodes: Array<OperationCode>): Quote {
      quote.risk = _buildQuoteRisk(command.risk, partner)
      quote.insurance = getInsurance(quote.risk, partner.offer)
      quote.policyHolder = _buildQuotePolicyHolder(quote, command)
      _applyStartDate(quote, command.startDate)
      _applyOperationCode(quote, partnerAvailableCodes, command.specOpsCode)
      return quote
    }

    export function setPolicyHolderEmailValidatedAt (quote: Quote, date: Date): Quote {
        quote.policyHolder!.emailValidatedAt = date
        return quote
    }

    function _buildQuotePolicyHolder (quote: Quote, command: UpdateQuoteCommand): Quote.PolicyHolder {
      return {
        firstname: command.risk.person?.firstname,
        lastname: command.risk.person?.lastname,
        address: command.risk.property.address,
        postalCode: command.risk.property.postalCode,
        city: command.risk.property.city,
        email: command.policyHolder?.email,
        phoneNumber: command.policyHolder?.phoneNumber,
        emailValidatedAt: _isUpdatedPolicyHolderEmail(quote, command) ? undefined : quote.policyHolder!.emailValidatedAt
      }
    }

    function _buildQuoteRisk (risk: UpdateQuoteCommand.Risk, partner: Partner) {
      const roomCount: number = risk.property.roomCount
      const numberOfRoommates: number|null = risk.otherPeople ? risk.otherPeople?.length : null

      if (!PartnerFunc.isPropertyRoomCountCovered(partner, roomCount)) {
        throw new QuoteRiskPropertyRoomCountNotInsurableError(roomCount)
      }

      if (numberOfRoommates) {
        if (!PartnerFunc.isPropertyAllowNumberOfRoommates(partner, numberOfRoommates, risk)) {
          const maxRoommatesForProperty: number = PartnerFunc.getMaxNumberOfRoommatesForProperty(partner, risk)
          if (maxRoommatesForProperty === 0) { throw new QuoteRiskRoommatesNotAllowedError(roomCount) }
          throw new QuoteRiskNumberOfRoommatesError(maxRoommatesForProperty, roomCount)
        }
      }

      return {
        property: {
          roomCount: risk.property.roomCount,
          address: risk.property.address ? risk.property.address : undefined,
          postalCode: risk.property.postalCode ? risk.property.postalCode : undefined,
          city: risk.property.city ? risk.property.city : undefined
        },
        person: risk.person ? {
          firstname: risk.person.firstname,
          lastname: risk.person.lastname
        } : undefined,
        otherPeople: risk.otherPeople ? risk.otherPeople.map(person => {
          return { firstname: person.firstname, lastname: person.lastname }
        }) : undefined
      }
    }

    export function applyNbMonthsDue (quote: Quote, nbMonthsDue: number): void {
      quote.premium = nbMonthsDue * quote.insurance.estimate.monthlyPrice
      quote.nbMonthsDue = nbMonthsDue

      if (quote.startDate) {
        quote.termEndDate = _computeTermEndDate(quote.startDate, nbMonthsDue)
      }
    }

    export function _isUpdatedPolicyHolderEmail (quote: Quote, updateQuoteCommand: UpdateQuoteCommand): boolean {
      return !(quote.policyHolder!.email === updateQuoteCommand.policyHolder!.email)
    }

    function _computeTermEndDate (termStartDate: Date, durationInMonths: number): Date {
      termStartDate.setUTCHours(0, 0, 0, 0)
      const termEndDate: Date = dayjs(termStartDate).utc()
        .add(durationInMonths, 'month')
        .subtract(1, 'day').toDate()
      return termEndDate
    }

    function _applyStartDate (quote: Quote, startDate?: Date): void {
      const now: Date = new Date()
      startDate = startDate || now
      startDate.setUTCHours(0, 0, 0, 0)

      const currentDate = _getUtcDayjsDate(now)
      const updatedStartDate = _getUtcDayjsDate(startDate)

      if (updatedStartDate.isBefore(currentDate)) throw new QuoteStartDateConsistencyError()
      quote.startDate = startDate
      quote.termStartDate = startDate
      quote.termEndDate = _computeTermEndDate(startDate, quote.nbMonthsDue)
    }

    function _getUtcDayjsDate (date: Date): dayjs.Dayjs {
      date.setUTCHours(0, 0, 0, 0)
      return dayjs(date).utc()
    }

    export function getInsurance (risk: Risk, partnerOffer: Partner.Offer): Insurance {
      const estimate: Insurance.Estimate | undefined = partnerOffer.pricingMatrix.get(risk.property.roomCount)

      if (estimate === undefined) {
        throw new QuoteRiskPropertyRoomCountNotInsurableError(risk.property.roomCount)
      }

      return <Insurance>{
        estimate,
        simplifiedCovers: partnerOffer.simplifiedCovers,
        currency: 'EUR',
        productCode: partnerOffer.productCode,
        productVersion: partnerOffer.productVersion,
        contractualTerms: partnerOffer.contractualTerms,
        ipid: partnerOffer.ipid
      }
    }

    export function nextId (): string {
      return generate({ length: 7, charset: 'alphanumeric', readable: true, capitalization: 'uppercase' })
    }

    function _applyOperationCode (quote: Quote, partnerApplicableCodes: Array<OperationCode>, codeToApply?: string): Quote {
      const operationCode: OperationCode = SpecialOperation.inferOperationCode(codeToApply)
      if (partnerApplicableCodes.concat(OperationCode.BLANK).includes(operationCode)) {
        switch (operationCode) {
          case OperationCode.SEMESTER1:
          case OperationCode.SEMESTER2:
            Quote.applyNbMonthsDue(quote, 5)
            quote.specialOperationsCode = operationCode
            quote.specialOperationsCodeAppliedAt = new Date()
            break
          case OperationCode.FULLYEAR:
            Quote.applyNbMonthsDue(quote, 10)
            quote.specialOperationsCode = operationCode
            quote.specialOperationsCodeAppliedAt = new Date()
            break
          case OperationCode.BLANK:
            Quote.applyNbMonthsDue(quote, 12)
            quote.specialOperationsCode = undefined
            quote.specialOperationsCodeAppliedAt = undefined
        }
      } else {
        throw new OperationCodeNotApplicableError(codeToApply!, quote.partnerCode)
      }
      return quote
    }

    export function isPolicyHolderEmailUndefined (quote: Quote): boolean {
      return !quote.policyHolder?.email
    }

    export function isEmailNoValidated (quote: Quote): boolean {
      return quote.policyHolder?.emailValidatedAt === undefined || quote.policyHolder?.emailValidatedAt === null
    }

    export function isPolicyRiskPropertyAddressMissing (quote: Quote): boolean { return !quote.risk.property.address }
    export function isPolicyRiskPropertyPostalCodeMissing (quote: Quote): boolean { return !quote.risk.property.postalCode }
    export function isPolicyRiskPropertyCityMissing (quote: Quote): boolean { return !quote.risk.property.city }

}

export namespace Quote.Risk {
    export interface Property {
        roomCount: number
        address?: string
        postalCode?: string
        city?: string
    }

    export interface Person {
        firstname: string,
        lastname: string
    }
}

export namespace Quote.Insurance {
    export interface Estimate {
        monthlyPrice: number,
        defaultDeductible: number,
        defaultCeiling: number,
    }

    export type SimplifiedCover = string
}
