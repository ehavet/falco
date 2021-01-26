import { dbTestUtils } from '../../../../utils/db.test-utils'
import { expect } from '../../../../test-utils'
import { CoverMonthlyPriceSqlRepository } from '../../../../../src/app/quotes/infrastructure/cover-monthly-price/cover-monthly-price-sql.repository'
import { PricingMatrixSqlModel } from '../../../../../src/app/quotes/infrastructure/cover-monthly-price/pricing-matrix-sql.model'
import { DefaultCapAdviceSqlModel } from '../../../../../src/app/quotes/infrastructure/default-cap-advice/default-cap-advice-sql.model'
import {
  CoverMonthlyPriceConsistencyError,
  CoverMonthlyPriceNotFoundError
} from '../../../../../src/app/quotes/domain/cover-monthly-price/cover-monthly-price.error'
import { CoverPricingZone } from '../../../../../src/app/quotes/domain/cover-pricing-zone/cover-pricing-zone'

describe('Quotes - Infra - CoverMonthlyPriceSql Repository', async () => {
  const coverMonthlyPriceSqlRepository = new CoverMonthlyPriceSqlRepository()
  const partnerCode = 'myTestPartner'

  before(async () => {
    await dbTestUtils.initDB()
  })

  after(async () => {
    await dbTestUtils.closeDB()
  })

  describe('#getAllForPartnerByPricingZone', async () => {
    afterEach(async () => {
      await PricingMatrixSqlModel.destroy({ where: { partner: partnerCode } })
    })

    const pricingZones: CoverPricingZone[] = [
      { zone: 'ZA1', cover: 'DDEAUX' },
      { zone: 'ZB2', cover: 'INCEND' },
      { zone: 'ZC3', cover: 'VOLXXX' }
    ]

    it('should return all pricing matrices as an amount for the given partner and room count', async () => {
      // Given
      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.81333', pricingZone: 'ZA1' },
        { partner: partnerCode, roomCount: 1, cover: 'INCEND', coverMonthlyPrice: '1.16750', pricingZone: 'ZB2' },
        { partner: partnerCode, roomCount: 1, cover: 'VOLXXX', coverMonthlyPrice: '0.84417', pricingZone: 'ZC3' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)

      // When
      const coverMonthlyPrices = await coverMonthlyPriceSqlRepository.getAllForPartnerByPricingZone(partnerCode, pricingZones, 1)

      // Then
      expect(coverMonthlyPrices).to.deep.equal([{ price: '1.81333', cover: 'DDEAUX' }, { price: '1.16750', cover: 'INCEND' }, { price: '0.84417', cover: 'VOLXXX' }])
    })

    it('should throw an error if there is no cover monthly prices for the given partner', async () => {
      // Given
      await DefaultCapAdviceSqlModel.create({ partner: partnerCode, roomCount: 2 })

      // When
      const promise = coverMonthlyPriceSqlRepository.getAllForPartnerByPricingZone('myOtherPartner', pricingZones, 2)

      // Then
      return expect(promise).to.be.rejectedWith(CoverMonthlyPriceNotFoundError)
    })

    it('should throw an error if there is multiple monthly prices for one cover', async () => {
      // Given
      await DefaultCapAdviceSqlModel.create({ partner: partnerCode, roomCount: 2 })

      const pricingZones: CoverPricingZone[] = [
        { zone: 'ZA1', cover: 'DDEAUX' }
      ]

      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.81333', pricingZone: 'ZA1' },
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.16750', pricingZone: 'ZA1' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)

      // When
      const promise = coverMonthlyPriceSqlRepository.getAllForPartnerByPricingZone(partnerCode, pricingZones, 1)

      // Then
      return expect(promise).to.be.rejectedWith(CoverMonthlyPriceConsistencyError)
    })

    it('should set to 0 if coverMonthlyPrice is empty', async () => {
      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: null, pricingZone: 'ZA1' },
        { partner: partnerCode, roomCount: 1, cover: 'VOLXXX', coverMonthlyPrice: '1.16750', pricingZone: 'ZC3' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)

      // When
      const coverMonthlyPrices = await coverMonthlyPriceSqlRepository.getAllForPartnerByPricingZone(partnerCode, pricingZones, 1)

      // Then
      expect(coverMonthlyPrices).to.deep.equal([
        { price: '0', cover: 'DDEAUX' },
        { price: '1.16750', cover: 'VOLXXX' }])
    })
  })

  describe('#getAllForPartnerWithoutZone', async () => {
    afterEach(async () => {
      await PricingMatrixSqlModel.destroy({ where: { partner: partnerCode } })
    })

    it('should return all cover monthly pricing matrices for a given partner and room count', async () => {
      // Given
      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.81333', pricingZone: 'ZNOTFOUND' },
        { partner: partnerCode, roomCount: 1, cover: 'INCEND', coverMonthlyPrice: '1.16750', pricingZone: 'ZNOTFOUND' },
        { partner: partnerCode, roomCount: 1, cover: 'VOLXXX', coverMonthlyPrice: '0.84417', pricingZone: 'ZNOTFOUND' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)

      // When
      const coverMonthlyPrices = await coverMonthlyPriceSqlRepository.getAllForPartnerWithoutZone(partnerCode, 1)

      // Then
      expect(coverMonthlyPrices).to.deep.equal([
        { price: '1.81333', cover: 'DDEAUX' },
        { price: '1.16750', cover: 'INCEND' },
        { price: '0.84417', cover: 'VOLXXX' }
      ])
    })

    it('should throw an error if there is no cover monthly prices for the given partner', async () => {
      // Given
      await DefaultCapAdviceSqlModel.create({ partner: partnerCode, roomCount: 2 })

      // When
      const promise = coverMonthlyPriceSqlRepository.getAllForPartnerWithoutZone('myOtherPartner', 2)

      // Then
      return expect(promise).to.be.rejectedWith(CoverMonthlyPriceNotFoundError)
    })

    it('should throw an error if there is multiple monthly prices for one cover', async () => {
      // Given
      await DefaultCapAdviceSqlModel.create({ partner: partnerCode, roomCount: 2 })

      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.81333', pricingZone: 'ZNOTFOUND' },
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.16750', pricingZone: 'ZNOTFOUND' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)

      // When
      const promise = coverMonthlyPriceSqlRepository.getAllForPartnerWithoutZone(partnerCode, 1)

      // Then
      return expect(promise).to.be.rejectedWith(CoverMonthlyPriceConsistencyError)
    })

    it('should set to 0 if coverMonthlyPrice is empty', async () => {
      // Given
      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: null, pricingZone: 'ZNOTFOUND' },
        { partner: partnerCode, roomCount: 1, cover: 'VOLXXX', coverMonthlyPrice: '1.16750', pricingZone: 'ZNOTFOUND' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)

      // When
      const coverMonthlyPrices = await coverMonthlyPriceSqlRepository.getAllForPartnerWithoutZone(partnerCode, 1)

      // Then
      expect(coverMonthlyPrices).to.deep.equal([
        { price: '0', cover: 'DDEAUX' },
        { price: '1.16750', cover: 'VOLXXX' }])
    })
  })
})
