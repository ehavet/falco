import { CoverPricingZone } from '../cover-pricing-zone/cover-pricing-zone'
import { CoverMonthlyPriceTaxRepartition } from './cover-monthly-price-tax-repartition'

export interface CoverMonthlyPriceTaxRepartitionRepository {
    get(partnerCode: string, pricingZones: CoverPricingZone[], roomCount: number): Promise<Array<CoverMonthlyPriceTaxRepartition>>
}
