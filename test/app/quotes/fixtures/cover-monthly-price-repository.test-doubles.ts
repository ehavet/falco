import { sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { CoverMonthlyPriceRepository } from '../../../../src/app/quotes/domain/cover-monthly-price/cover-monthly-price.repository'

export function coverMonthlyPriceRepositoryStub (attr = {}): SinonStubbedInstance<CoverMonthlyPriceRepository> {
  return {
    getAllForPartnerByPricingZone: sinon.stub(),
    getAllForPartnerWithoutZone: sinon.stub(),
    ...attr
  }
}
