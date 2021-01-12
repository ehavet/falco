import { Cover } from '../../domain/cover/cover'
import { PricingMatrixSqlModel } from './pricing-matrix-sql.model'
import { CoverNotFoundError } from '../../domain/cover/cover.error'
import { CoverRepository } from '../../domain/cover/cover.repository'

export class CoverSqlRepository implements CoverRepository {
  async getCovers (partnerCode: string, roomCount: number): Promise<Array<Cover>> {
    const pricingMatrices = await PricingMatrixSqlModel.findAll({ where: { partner: partnerCode, roomCount }, raw: true })

    if (pricingMatrices.length === 0) throw new CoverNotFoundError(partnerCode)

    return pricingMatrices.map(pricingMatrix => ({ monthlyPrice: pricingMatrix.coverMonthlyPrice }))
  }
}
