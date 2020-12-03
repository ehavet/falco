import { sinon } from '../../../../test-utils'

export function paymentProcessorMock (attr = {}) {
  return {
    createPaymentIntent: sinon.mock(),
    getTransactionFee: sinon.mock(),
    ...attr
  }
}

export function paymentProcessorStub (attr = {}) {
  return {
    createPaymentIntent: sinon.stub(),
    getTransactionFee: sinon.stub(),
    ...attr
  }
}
