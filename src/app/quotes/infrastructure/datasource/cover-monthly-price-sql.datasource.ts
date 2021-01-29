import { CoverPricingZone } from '../../domain/cover-pricing-zone/cover-pricing-zone'
import { PricingMatrixSqlModel } from '../cover-monthly-price/pricing-matrix-sql.model'
import { ZNOTFOUND } from '../../domain/cover'

export const getAllByPricingZone = async (partnerCode: string, pricingZones: CoverPricingZone[], roomCount: number): Promise<Array<PricingMatrixSqlModel>> => {
  return PricingMatrixSqlModel.findAll(
    {
      where: {
        partner: partnerCode,
        roomCount,
        pricingZone: pricingZones.map(pricingZone => pricingZone.zone)
      },
      raw: true
    })
}

export const getAllWithoutZone = async (partnerCode: string, roomCount: number): Promise<Array<PricingMatrixSqlModel>> => {
  return PricingMatrixSqlModel.findAll(
    {
      where: {
        partner: partnerCode,
        roomCount,
        pricingZone: ZNOTFOUND
      },
      raw: true
    })
}
