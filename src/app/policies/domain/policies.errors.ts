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

export class PolicyRiskPropertyMissingFieldError extends Error {
  constructor (quoteId: string, fieldName: string) {
    const message: string = `Quote ${quoteId} risk property ${fieldName} should be completed`
    super(message)
    this.name = 'PolicyRiskPropertyMissingFieldError'
  }
}
