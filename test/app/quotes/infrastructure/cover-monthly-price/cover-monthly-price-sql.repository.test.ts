import { dbTestUtils } from '../../../../utils/db.test-utils'
import { expect } from '../../../../test-utils'
import { CoverMonthlyPriceSqlRepository } from '../../../../../src/app/quotes/infrastructure/cover-monthly-price/cover-monthly-price-sql.repository'
import { PricingMatrixSqlModel } from '../../../../../src/app/quotes/infrastructure/cover-monthly-price/pricing-matrix-sql.model'
import { DefaultCapAdviceSqlModel } from '../../../../../src/app/quotes/infrastructure/default-cap-advice/default-cap-advice-sql.model'
import { CoverNotFoundError } from '../../../../../src/app/quotes/domain/cover/cover.error'

describe('Quotes - Infra - CoverMonthlyPriceSql Repository', async () => {
  const coverMonthlyPriceSqlRepository = new CoverMonthlyPriceSqlRepository()
  const partnerCode = 'myTestPartner'

  before(async () => {
    await dbTestUtils.initDB()
  })

  after(async () => {
    await dbTestUtils.closeDB()
  })

  afterEach(async () => {
    await PricingMatrixSqlModel.destroy({ where: { partner: partnerCode } })
  })

  describe('#get', async () => {
    it('should return all pricing matrices as an amount for the given partner and room count', async () => {
      // Given
      const pricingMatrixFixture = [
        { partner: partnerCode, roomCount: 1, cover: 'DDEAUX', coverMonthlyPrice: '1.813330' },
        { partner: partnerCode, roomCount: 1, cover: 'INCEND', coverMonthlyPrice: '1.167500' },
        { partner: partnerCode, roomCount: 1, cover: 'VOLXXX', coverMonthlyPrice: '0.844170' }
      ]
      await PricingMatrixSqlModel.bulkCreate(pricingMatrixFixture)

      // When
      const coverMonthlyPrices = await coverMonthlyPriceSqlRepository.get(partnerCode, 1)

      // Then
      expect(coverMonthlyPrices).to.deep.equal([{ monthlyPrice: '1.813330' }, { monthlyPrice: '1.167500' }, { monthlyPrice: '0.844170' }])
    })

    it('should throw an error if there is no cover monthly prices for the given partner', async () => {
      // Given
      await DefaultCapAdviceSqlModel.create({ partner: partnerCode, roomCount: 2 })

      // When
      const promise = coverMonthlyPriceSqlRepository.get('myOtherPartner', 2)

      // Then
      return expect(promise).to.be.rejectedWith(CoverNotFoundError)
    })
  })
})
