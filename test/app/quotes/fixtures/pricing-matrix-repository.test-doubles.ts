import { sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { CoverRepository } from '../../../../src/app/quotes/domain/cover/cover.repository'

export function coverRepositoryStub (attr = {}): SinonStubbedInstance<CoverRepository> {
  return {
    getCovers: sinon.stub(),
    ...attr
  }
}
