import { sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { CoverMonthlyPriceRepository } from '../../../../src/app/quotes/domain/cover/coverMonthlyPriceRepository'

export function coverMonthlyPriceRepositoryStub (attr = {}): SinonStubbedInstance<CoverMonthlyPriceRepository> {
  return {
    get: sinon.stub(),
    ...attr
  }
}
