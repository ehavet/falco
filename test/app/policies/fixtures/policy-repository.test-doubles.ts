import { sinon } from '../../../test-utils'

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

export function policyRepositoryStub (attr = {}) {
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
