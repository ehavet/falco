import { CoverPricingZone } from './cover-pricing-zone'

export interface CoverPricingZoneRepository {
    getAllForProductByLocation(productCode: string, city: string, postalCode: string): Promise<CoverPricingZone[]>
}
