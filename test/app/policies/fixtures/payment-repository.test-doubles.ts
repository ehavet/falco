import { sinon } from '../../../test-utils'

export function paymentRepositoryMock (attr = {}) {
  return {
    save: sinon.mock(),
    ...attr
  }
}

export function paymentRepositoryStub (attr = {}) {
  return {
    save: sinon.stub(),
    ...attr
  }
}
