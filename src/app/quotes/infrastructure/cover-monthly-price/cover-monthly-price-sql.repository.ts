import { CoverMonthlyPrice } from '../../domain/cover/coverMonthlyPrice'
import { PricingMatrixSqlModel } from './pricing-matrix-sql.model'
import { CoverMonthlyPriceConsistencyError, CoverMonthlyPriceNotFoundError } from '../../domain/cover/cover.error'
import { CoverMonthlyPriceRepository } from '../../domain/cover/coverMonthlyPriceRepository'

export class CoverMonthlyPriceSqlRepository implements CoverMonthlyPriceRepository {
  async get (partnerCode: string, roomCount: number): Promise<Array<CoverMonthlyPrice>> {
    const pricingMatrices = await PricingMatrixSqlModel.findAll({ where: { partner: partnerCode, roomCount }, raw: true })

    if (pricingMatrices.length === 0) throw new CoverMonthlyPriceNotFoundError(partnerCode)

    if (isInconsistantMatrices(pricingMatrices)) throw new CoverMonthlyPriceConsistencyError(partnerCode)

    return pricingMatrices.map(pricingMatrix => ({
      coverMonthlyPrice: pricingMatrix.coverMonthlyPrice,
      cover: pricingMatrix.cover
    }))
  }
}

function isInconsistantMatrices (pricingMatrices: Array<PricingMatrixSqlModel>): boolean {
  const covers = pricingMatrices.map(pricingMatrix => pricingMatrix.cover)
  return new Set(covers).size !== covers.length
}
