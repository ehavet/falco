import { sinon } from '../../../test-utils'
import { SinonStubbedInstance } from 'sinon'
import { CoverPricingZoneRepository } from '../../../../src/app/quotes/domain/cover-pricing-zone/cover-pricing-zone.repository'

export function pricingZoneRepositoryStub (attr = {}): SinonStubbedInstance<CoverPricingZoneRepository> {
  return {
    getAllForProductByLocation: sinon.stub(),
    ...attr
  }
}

export function pricingZoneRepositoryMock (attr = {}): SinonStubbedInstance<CoverPricingZoneRepository> {
  return {
    getAllForProductByLocation: sinon.mock(),
    ...attr
  }
}
