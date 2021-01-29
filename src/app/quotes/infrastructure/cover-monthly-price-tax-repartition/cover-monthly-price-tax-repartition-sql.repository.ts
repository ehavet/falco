import { CoverMonthlyPriceTaxRepartitionRepository } from '../../domain/cover-monthly-price-tax-repartition/cover-monthly-price-tax-repartition.repository'
import { CoverPricingZone } from '../../domain/cover-pricing-zone/cover-pricing-zone'
import { CoverMonthlyPriceTaxRepartition } from '../../domain/cover-monthly-price-tax-repartition/cover-monthly-price-tax-repartition'
import { PricingMatrixSqlModel } from '../cover-monthly-price/pricing-matrix-sql.model'
import {
  CoverMonthlyPriceTaxRepartitionConsistencyError,
  CoverMonthlyPriceTaxRepartitionNotFoundError
} from '../../domain/cover-monthly-price-tax-repartition/cover-monthly-price-tax-repartition.error'
import * as CoverMonthlyPriceSqlDatasource from '../datasource/cover-monthly-price-sql.datasource'
import { ZNOTFOUND } from '../../domain/cover-pricing-zone/pricing-zone'

export class CoverMonthlyPriceTaxRepartitionSqlRepository implements CoverMonthlyPriceTaxRepartitionRepository {
  async getAll (partnerCode: string, coverPricingZones: CoverPricingZone[], roomCount: number): Promise<Array<CoverMonthlyPriceTaxRepartition>> {
    const pricingZones = coverPricingZones.map(coverPricingZone => coverPricingZone.zone)
    const pricingMatrices = await CoverMonthlyPriceSqlDatasource.getAllByPricingZone(partnerCode, pricingZones, roomCount)

    if (pricingMatrices.length === 0) throw new CoverMonthlyPriceTaxRepartitionNotFoundError(partnerCode)

    if (isInconsistentMatrices(pricingMatrices)) throw new CoverMonthlyPriceTaxRepartitionConsistencyError(partnerCode)

    return toCoverMonthlyPriceTaxRepartitions(pricingMatrices)
  }

  async getAllWithoutZone (partnerCode: string, roomCount: number): Promise<Array<CoverMonthlyPriceTaxRepartition>> {
    const pricingMatrices = await CoverMonthlyPriceSqlDatasource.getAllByPricingZone(partnerCode, [ZNOTFOUND], roomCount)

    if (pricingMatrices.length === 0) throw new CoverMonthlyPriceTaxRepartitionNotFoundError(partnerCode)

    if (isInconsistentMatrices(pricingMatrices)) throw new CoverMonthlyPriceTaxRepartitionConsistencyError(partnerCode)

    return toCoverMonthlyPriceTaxRepartitions(pricingMatrices)
  }
}

const toCoverMonthlyPriceTaxRepartitions = (pricingMatrices: PricingMatrixSqlModel[]): Array<CoverMonthlyPriceTaxRepartition> => (
  pricingMatrices.map(pricingMatrix => ({
    priceExclTax: pricingMatrix.coverMonthlyPriceExclTax,
    priceTax: pricingMatrix.coverMonthlyPriceTax,
    cover: pricingMatrix.cover
  }))
)

const isInconsistentMatrices = (pricingMatrices: Array<PricingMatrixSqlModel>): boolean => {
  const covers = pricingMatrices.map(pricingMatrix => pricingMatrix.cover)
  return new Set(covers).size !== covers.length
}
