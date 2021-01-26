import { dbTestUtils } from '../../../utils/db.test-utils'
import { CoverPricingZoneSqlModel } from '../../../../src/app/quotes/infrastructure/cover-pricing-zone/cover-pricing-zone-sql.model'

const IDS = [
  'd1522991-1316-4424-b562-d6f368bb37e8',
  '4d68d9df-8b46-45a0-889d-04178bcd769d',
  'a446a1c2-c69f-42c2-9071-9d29c78b7295'
]

export async function setPricingZoneSqlFixture (productCode: string, city: string, postalCode: string) {
  await dbTestUtils.initDB()
  await CoverPricingZoneSqlModel.bulkCreate([
    { id: IDS[0], product: productCode, postalCode: postalCode, cover: 'DDEAUX_FAKE', cityCode: '00000', city: city, pricingZone: 'ABC1' },
    { id: IDS[1], product: productCode, postalCode: postalCode, cover: 'INCEND_FAKE', cityCode: '00000', city: city, pricingZone: 'XYZ2' },
    { id: IDS[2], product: productCode, postalCode: postalCode, cover: 'VOLXXX_FAKE', cityCode: '00000', city: city, pricingZone: 'FRANCE' }
  ])
}

export async function clearPricingZoneSqlFixture () {
  await CoverPricingZoneSqlModel.destroy({ where: { id: IDS } })
}
