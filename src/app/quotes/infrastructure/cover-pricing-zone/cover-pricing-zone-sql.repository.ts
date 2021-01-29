import { CoverPricingZoneRepository } from '../../domain/cover-pricing-zone/cover-pricing-zone.repository'
import { CoverPricingZone } from '../../domain/cover-pricing-zone/cover-pricing-zone'
import { CoverPricingZoneSqlModel } from './cover-pricing-zone-sql.model'
import { PricingZoneConsistencyError } from '../../domain/cover-pricing-zone/cover-pricing-zone.errors'
import { ZNOTFOUND } from '../../domain/cover'

export class CoverPricingZoneSqlRepository implements CoverPricingZoneRepository {
  async getAllForProductByLocation (productCode: string, city?: string, postalCode?: string): Promise<CoverPricingZone[]> {
    const pricingZoneSql = await CoverPricingZoneSqlModel.findAll({
      where: {
        product: productCode,
        city: city || null,
        postalCode: postalCode || null
      }
    })

    if (isMissingCover(pricingZoneSql)) throw new PricingZoneConsistencyError(productCode, postalCode, city)

    return this.sqlToPricingZone(pricingZoneSql)
  }

  sqlToPricingZone (pricingZoneSql: Array<CoverPricingZoneSqlModel>): CoverPricingZone[] {
    return pricingZoneSql.map(zone => {
      return {
        zone: zone.pricingZone || ZNOTFOUND,
        cover: zone.cover
      }
    })
  }
}

function isMissingCover (pricingZones: Array<CoverPricingZoneSqlModel>) {
  const covers = pricingZones.filter(pricingZone => pricingZone.cover)

  return covers.length !== pricingZones.length
}
