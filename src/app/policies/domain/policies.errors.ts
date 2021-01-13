import { Policy } from './policy'

export class PolicyNotFoundError extends Error {
  constructor (policyId: string) {
    const message: string = `Could not find policy with id : ${policyId}`
    super(message)
    this.name = 'PolicyNotFoundError'
  }
}

export class PolicyNotUpdatableError extends Error {
  constructor (policyId: string, status: Policy.Status) {
    const message: string = `Could not update policy ${policyId} because it is already ${status}`
    super(message)
    this.name = 'PolicyNotUpdatableError'
  }
}

export class PolicyCanceledError extends Error {
  constructor (policyId: string) {
    const message: string = `The policy ${policyId} has been canceled`
    super(message)
    this.name = 'PolicyCanceledError'
  }
}

export class PolicyAlreadyPaidError extends Error {
  constructor (policyId: string) {
    const message: string = `The policy ${policyId} has already been paid`
    super(message)
    this.name = 'PolicyAlreadyPaidError'
  }
}

export class PolicyAlreadySignedError extends Error {
  constructor (policyId: string) {
    const message: string = `The policy ${policyId} has already been signed`
    super(message)
    this.name = 'PolicyAlreadySignedError'
  }
}

export class PolicyStartDateConsistencyError extends Error {
  constructor () {
    const message: string = 'Start date cannot be earlier than today'
    super(message)
    this.name = 'PolicyStartDateConsistencyError'
  }
}

export class PolicyRiskRoommatesNotAllowedError extends Error {
  constructor () {
    const message: string = 'Adding roommates is not allowed'
    super(message)
    this.name = 'PolicyRiskRoommatesNotAllowedError'
  }
}

export class PolicyRiskNumberOfRoommatesError extends Error {
  constructor (maxRoommateNumber: number, roomCount: number) {
    const message: string = `A property of ${roomCount} room(s) allows a maximum of ${maxRoommateNumber} roommate(s)`
    super(message)
    this.name = 'PolicyRiskNumberOfRoommatesError'
  }
}

export class PolicyHolderEmailValidationError extends Error {
  constructor (quoteId: string) {
    const message: string = `Quote ${quoteId} policy holder email should have been validated`
    super(message)
    this.name = 'PolicyHolderEmailValidationError'
  }
}

export class PolicyHolderMissingError extends Error {
  constructor (quoteId: string) {
    const message: string = `Quote ${quoteId} policy holder should be completed`
    super(message)
    this.name = 'PolicyHolderMissingError'
  }
}

export class PolicyHolderMissingPropertyError extends Error {
  constructor (quoteId: string, propertyName: string) {
    const message: string = `Quote ${quoteId} policy holder ${propertyName} should be completed`
    super(message)
    this.name = 'PolicyHolderMissingPropertyError'
  }
}

export class PolicyRiskPersonMissingError extends Error {
  constructor (quoteId: string) {
    const message: string = `Quote ${quoteId} risk person should be completed`
    super(message)
    this.name = 'PolicyRiskPersonMissingError'
  }
}

export class PolicyRiskPropertyMissingFieldError extends Error {
  constructor (quoteId: string, fieldName: string) {
    const message: string = `Quote ${quoteId} risk property ${fieldName} should be completed`
    super(message)
    this.name = 'PolicyRiskPropertyMissingFieldError'
  }
}

export class PolicyRiskPropertyTypeNotInsurableError extends Error {
  constructor (propertyType: string | undefined) {
    const message: string = `Cannot create policy, ${propertyType} is not insured by this partner`
    super(message)
    this.name = 'PolicyRiskPropertyTypeNotInsurableError'
  }
}

export class CreatePolicyQuotePartnerOwnershipError extends Error {
  constructor (quoteId: string, partnerCode: string) {
    const message: string = `Could not create policy with quote ${quoteId} that does not belong to ${partnerCode}`
    super(message)
    this.name = 'CreatePolicyQuotePartnerOwnershipError'
  }
}
