import { CoverMonthlyPrice } from '../../domain/cover-monthly-price/cover-monthly-price'
import { PricingMatrixSqlModel } from './pricing-matrix-sql.model'
import { CoverMonthlyPriceConsistencyError, CoverMonthlyPriceNotFoundError } from '../../domain/cover-monthly-price/cover-monthly-price.error'
import { CoverMonthlyPriceRepository } from '../../domain/cover-monthly-price/cover-monthly-price.repository'
import { CoverPricingZone } from '../../domain/cover-pricing-zone/cover-pricing-zone'
import { ZNOTFOUND } from '../../domain/cover'

const DEFAULT_COVER_MONTHLY_PRICE = '0'

export class CoverMonthlyPriceSqlRepository implements CoverMonthlyPriceRepository {
  async getAllForPartnerByPricingZone (partnerCode: string, pricingZones: CoverPricingZone[], roomCount: number): Promise<Array<CoverMonthlyPrice>> {
    const pricingMatrices = await PricingMatrixSqlModel.findAll(
      {
        where: {
          partner: partnerCode,
          roomCount,
          pricingZone: pricingZones.map(pricingZone => pricingZone.zone)
        },
        raw: true
      })

    if (pricingMatrices.length === 0) throw new CoverMonthlyPriceNotFoundError(partnerCode)

    if (isInconsistentMatrices(pricingMatrices)) throw new CoverMonthlyPriceConsistencyError(partnerCode)

    return toCoverMonthlyPrices(pricingMatrices)
  }

  async getAllForPartnerWithoutZone (partnerCode: string, roomCount: number): Promise<Array<CoverMonthlyPrice>> {
    const pricingMatrices: PricingMatrixSqlModel[] = await PricingMatrixSqlModel.findAll(
      {
        where: {
          partner: partnerCode,
          roomCount,
          pricingZone: ZNOTFOUND
        },
        raw: true
      })

    if (pricingMatrices.length === 0) throw new CoverMonthlyPriceNotFoundError(partnerCode)

    if (isInconsistentMatrices(pricingMatrices)) throw new CoverMonthlyPriceConsistencyError(partnerCode)

    return toCoverMonthlyPrices(pricingMatrices)
  }
}

const toCoverMonthlyPrices = (pricingMatrices: PricingMatrixSqlModel[]): Array<CoverMonthlyPrice> => (
  pricingMatrices.map(pricingMatrix => ({
    price: pricingMatrix.coverMonthlyPrice || DEFAULT_COVER_MONTHLY_PRICE,
    cover: pricingMatrix.cover
  }))
)

const isInconsistentMatrices = (pricingMatrices: Array<PricingMatrixSqlModel>): boolean => {
  const covers = pricingMatrices.map(pricingMatrix => pricingMatrix.cover)
  return new Set(covers).size !== covers.length
}
