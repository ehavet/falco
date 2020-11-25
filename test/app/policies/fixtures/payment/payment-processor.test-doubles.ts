import { sinon } from '../../../../test-utils'

export function paymentProcessorMock (attr = {}) {
  return {
    createIntent: sinon.mock(),
    getTransactionFee: sinon.mock(),
    ...attr
  }
}

export function paymentProcessorStub (attr = {}) {
  return {
    createIntent: sinon.stub(),
    getTransactionFee: sinon.stub(),
    ...attr
  }
}
