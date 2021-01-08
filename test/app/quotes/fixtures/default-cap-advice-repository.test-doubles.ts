import { sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { DefaultCapAdviceRepository } from '../../../../src/app/quotes/domain/default-cap-advice/default-cap-advice.repository'

export function defaultCapAdviceRepositoryStub (attr = {}): SinonStubbedInstance<DefaultCapAdviceRepository> {
  return {
    get: sinon.stub(),
    ...attr
  }
}
