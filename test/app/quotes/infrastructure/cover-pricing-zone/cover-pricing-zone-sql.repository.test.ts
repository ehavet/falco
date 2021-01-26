import { dbTestUtils, expect } from '../../../../test-utils'
import { CoverPricingZoneSqlRepository } from '../../../../../src/app/quotes/infrastructure/cover-pricing-zone/cover-pricing-zone-sql.repository'
import { CoverPricingZoneSqlModel } from '../../../../../src/app/quotes/infrastructure/cover-pricing-zone/cover-pricing-zone-sql.model'
import { CoverPricingZone } from '../../../../../src/app/quotes/domain/cover-pricing-zone/cover-pricing-zone'
import { PricingZoneConsistencyError } from '../../../../../src/app/quotes/domain/cover-pricing-zone/cover-pricing-zone.errors'
import { setPricingZoneSqlFixture } from '../../fixtures/pricing-zone.sql.fixture'

describe('Quotes - Infra - Cover Pricing Zone Repository', async () => {
  const pricingZoneRepository = new CoverPricingZoneSqlRepository()
  const productCode = 'FAK333'

  before(async () => {
    await dbTestUtils.initDB()
  })

  after(async () => {
    await dbTestUtils.closeDB()
  })

  describe('#getAllForProductByLocation', async () => {
    afterEach(async () => {
      await CoverPricingZoneSqlModel.destroy({ where: { product: productCode } })
    })

    it('should return the product pricing zone list for an address', async () => {
      // Given
      await setPricingZoneSqlFixture(productCode, 'Paris', '99000')

      const pricingZones: CoverPricingZone[] = [
        { zone: 'ABC1', cover: 'DDEAUX_FAKE' },
        { zone: 'XYZ2', cover: 'INCEND_FAKE' },
        { zone: 'FRANCE', cover: 'VOLXXX_FAKE' }
      ]

      // When
      const result: CoverPricingZone[] = await pricingZoneRepository.getAllForProductByLocation(productCode, 'Paris', '99000')
      // Then
      expect(result).to.deep.equal(pricingZones)
    })

    it('should return ZNOTFOUND if pricing_zone is empty', async () => {
      // Given
      const pricingZoneFixture = { product: productCode, postalCode: '99000', cover: 'DDEAUX', cityCode: '66000', city: 'Paris', pricingZone: null }
      await CoverPricingZoneSqlModel.create(pricingZoneFixture)

      const pricingZones: CoverPricingZone[] = [
        { zone: 'ZNOTFOUND', cover: 'DDEAUX' }
      ]

      // When
      const result: CoverPricingZone[] = await pricingZoneRepository.getAllForProductByLocation(productCode, 'Paris', '99000')
      // Then
      expect(result).to.deep.equal(pricingZones)
    })

    it('should throw an PricingZoneConsistencyError inconsistency if cover is empty', async () => {
      // Given
      const pricingZoneFixture = { product: productCode, postalCode: '99000', cover: null, cityCode: '66000', city: 'Paris', pricingZone: 'ZD1' }
      await CoverPricingZoneSqlModel.create(pricingZoneFixture)

      // When
      const result: Promise<CoverPricingZone[]> = pricingZoneRepository.getAllForProductByLocation(productCode, 'Paris', '99000')
      // Then
      expect(result).to.be.rejectedWith(PricingZoneConsistencyError)
    })

    it('should return empty cover monthly prices if city or postal code is not found', async () => {
      // Given
      const pricingZoneFixture = { product: productCode, postalCode: '99000', cover: null, cityCode: '66000', city: 'Paris', pricingZone: 'ZD1' }
      await CoverPricingZoneSqlModel.create(pricingZoneFixture)

      // When
      const result: CoverPricingZone[] = await pricingZoneRepository.getAllForProductByLocation(productCode, 'Nowhere', '99000')
      // Then
      expect(result).to.deep.equal([])
    })
  })
})
