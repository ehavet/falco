import { CoverMonthlyPrice } from './cover-monthly-price'
import { CoverPricingZone } from '../cover-pricing-zone/cover-pricing-zone'

export interface CoverMonthlyPriceRepository {
    getAllForPartnerByPricingZone(partnerCode: string, pricingZones: CoverPricingZone[], roomCount: number): Promise<Array<CoverMonthlyPrice>>

    getAllForPartnerWithoutZone(partnerCode: string, roomCount: number): Promise<Array<CoverMonthlyPrice>>
}
