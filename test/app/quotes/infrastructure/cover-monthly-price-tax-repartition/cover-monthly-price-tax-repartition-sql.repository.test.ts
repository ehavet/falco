import { dbTestUtils } from '../../../../utils/db.test-utils'
import { expect } from '../../../../test-utils'
import { PricingMatrixSqlModel } from '../../../../../src/app/quotes/infrastructure/cover-monthly-price/pricing-matrix-sql.model'
import { CoverPricingZone } from '../../../../../src/app/quotes/domain/cover-pricing-zone/cover-pricing-zone'
import { CoverMonthlyPriceTaxRepartitionSqlRepository } from '../../../../../src/app/quotes/infrastructure/cover-monthly-price-tax-repartition/cover-monthly-price-tax-repartition-sql.repository'
import {
  CoverMonthlyPriceTaxRepartitionConsistencyError,
  CoverMonthlyPriceTaxRepartitionNotFoundError
} from '../../../../../src/app/quotes/domain/cover-monthly-price-tax-repartition/cover-monthly-price-tax-repartition.error'

describe('Quotes - Infra - CoverMonthlyPriceTaxRepartitionSql Repository', async () => {
  const coverMonthlyPriceTaxRepartitionSqlRepository = new CoverMonthlyPriceTaxRepartitionSqlRepository()
  const partnerCode = 'myTestPartner'

  before(async () => {
    await dbTestUtils.initDB()
  })

  after(async () => {
    await dbTestUtils.closeDB()
  })

  describe('#get', async () => {
    afterEach(async () => {
      await PricingMatrixSqlModel.destroy({ where: { partner: partnerCode } })
    })

    const pricingZones: CoverPricingZone[] = [
      { zone: 'ZA1', cover: 'DDEAUX' },
      { zone: 'ZB2', cover: 'INCEND' },
      { zone: 'ZC3', cover: 'VOLXXX' }
    ]

    it('should return price tax repartition for given partner, room count and pricing zone', async () => {
      // Given
      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.81333', pricingZone: 'ZA1', coverMonthlyPriceExclTax: '1.00000', coverMonthlyPriceTax: '0.81333' },
        { partner: partnerCode, roomCount: 1, cover: 'INCEND', coverMonthlyPrice: '1.16750', pricingZone: 'ZB2', coverMonthlyPriceExclTax: '1.00000', coverMonthlyPriceTax: '0.16750' },
        { partner: partnerCode, roomCount: 1, cover: 'VOLXXX', coverMonthlyPrice: '0.84417', pricingZone: 'ZC3', coverMonthlyPriceExclTax: '0.80000', coverMonthlyPriceTax: '0.04417' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)

      // When
      const coverMonthlyPriceTaxRepartitions = await coverMonthlyPriceTaxRepartitionSqlRepository.get(partnerCode, pricingZones, 1)

      // Then
      expect(coverMonthlyPriceTaxRepartitions).to.deep.equal([
        { priceExclTax: '1.00000', priceTax: '0.81333', cover: 'DDEAUX' },
        { priceExclTax: '1.00000', priceTax: '0.16750', cover: 'INCEND' },
        { priceExclTax: '0.80000', priceTax: '0.04417', cover: 'VOLXXX' }])
    })

    it('should throw an error if there is no cover monthly price tax repartitions for the given partner', async () => {
      // Given
      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.81333', pricingZone: 'ZA1', coverMonthlyPriceExclTax: '1.00000', coverMonthlyPriceTax: '0.81333' },
        { partner: partnerCode, roomCount: 1, cover: 'INCEND', coverMonthlyPrice: '1.16750', pricingZone: 'ZB2', coverMonthlyPriceExclTax: '1.00000', coverMonthlyPriceTax: '0.16750' },
        { partner: partnerCode, roomCount: 1, cover: 'VOLXXX', coverMonthlyPrice: '0.84417', pricingZone: 'ZC3', coverMonthlyPriceExclTax: '0.80000', coverMonthlyPriceTax: '0.04417' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)
      // When
      const promise = coverMonthlyPriceTaxRepartitionSqlRepository.get('myOtherPartner', pricingZones, 1)

      // Then
      return expect(promise).to.be.rejectedWith(CoverMonthlyPriceTaxRepartitionNotFoundError)
    })

    it('should throw an error if there is multiple monthly prices for one cover', async () => {
      // Given
      const pricingZones: CoverPricingZone[] = [
        { zone: 'ZA1', cover: 'DDEAUX' }
      ]
      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.81333', pricingZone: 'ZA1' },
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.16750', pricingZone: 'ZA1' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)

      // When
      const promise = coverMonthlyPriceTaxRepartitionSqlRepository.get(partnerCode, pricingZones, 1)

      // Then
      return expect(promise).to.be.rejectedWith(CoverMonthlyPriceTaxRepartitionConsistencyError)
    })
  })
})
