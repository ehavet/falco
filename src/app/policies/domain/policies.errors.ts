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

export class PolicyAlreadyPaidError extends Error {
  constructor (policyId: string) {
    const message: string = `Policy ${policyId} has already been paid`
    super(message)
    this.name = 'PolicyAlreadyPaidError'
  }
}

export class PolicyAlreadySignedError extends Error {
  constructor (policyId: string) {
    const message: string = `Policy ${policyId} has already been signed`
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

export class RoommatesNotAllowedError extends Error {
  constructor (partnerCode) {
    const message: string = `The roommates are not allowed for partner ${partnerCode}`
    super(message)
    this.name = 'RoommatesNotAllowedError'
  }
}

export class NumberOfRoommatesError extends Error {
  constructor (numberOfRoommates: number, roomCount: number) {
    const message: string = `Partner does not allow ${numberOfRoommates} roommate(s) for a property of ${roomCount} room(s)`
    super(message)
    this.name = 'NumberOfRoommatesError'
  }
}
