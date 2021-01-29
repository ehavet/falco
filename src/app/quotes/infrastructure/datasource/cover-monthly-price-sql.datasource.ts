import { PricingMatrixSqlModel } from '../cover-monthly-price/pricing-matrix-sql.model'

export const getAllByPricingZone = async (partnerCode: string, pricingZones: string[], roomCount: number): Promise<Array<PricingMatrixSqlModel>> => {
  return PricingMatrixSqlModel.findAll(
    {
      where: {
        partner: partnerCode,
        roomCount,
        pricingZone: pricingZones
      },
      raw: true
    })
}
