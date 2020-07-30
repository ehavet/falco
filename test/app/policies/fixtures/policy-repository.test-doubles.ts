import { sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'

export function policyRepositoryMock (attr = {}) {
  return {
    save: sinon.mock(),
    isIdAvailable: sinon.mock(),
    get: sinon.mock(),
    setEmailValidationDate: sinon.mock(),
    updateAfterPayment: sinon.mock(),
    updateAfterSignature: sinon.mock(),
    update: sinon.mock(),
    ...attr
  }
}

export function policyRepositoryStub (attr = {}) : SinonStubbedInstance<PolicyRepository> {
  return {
    save: sinon.stub(),
    isIdAvailable: sinon.stub(),
    get: sinon.stub(),
    setEmailValidationDate: sinon.stub(),
    updateAfterPayment: sinon.stub(),
    updateAfterSignature: sinon.stub(),
    update: sinon.stub(),
    ...attr
  }
}
