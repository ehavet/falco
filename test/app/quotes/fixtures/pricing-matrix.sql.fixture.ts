import { PricingMatrixSqlModel } from '../../../../src/app/quotes/infrastructure/cover-monthly-price/pricing-matrix-sql.model'
import { dbTestUtils } from '../../../utils/db.test-utils'

const IDS = [
  'd1522991-1316-4424-b562-d6f368bb37e8',
  '4d68d9df-8b46-45a0-889d-04178bcd769d',
  'a446a1c2-c69f-42c2-9071-9d29c78b7295',
  'b3864f67-7406-4234-87ad-6cb563f2c84b',
  '251a523e-d3db-4bbb-a59c-39566a98a6df',
  '32c0606b-c466-4d14-9260-c8765e33ef76'
]

export async function setPricingMatrixSqlFixture (partnerCode: string, roomCount: number) {
  await dbTestUtils.initDB()
  await PricingMatrixSqlModel.bulkCreate([
    { id: IDS[0], partner: partnerCode, roomCount: roomCount, cover: 'DDEAUX_FAKE', coverMonthlyPrice: '1.81333', pricingZone: 'ABC1', coverMonthlyPriceNoTax: '1.01333', coverMonthlyPriceTax: '0.81333' },
    { id: IDS[1], partner: partnerCode, roomCount: roomCount, cover: 'INCEND_FAKE', coverMonthlyPrice: '1.16750', pricingZone: 'XYZ2', coverMonthlyPriceNoTax: '1.01333', coverMonthlyPriceTax: '0.81333' },
    { id: IDS[2], partner: partnerCode, roomCount: roomCount, cover: 'VOLXXX_FAKE', coverMonthlyPrice: '0.84417', pricingZone: 'FRANCE', coverMonthlyPriceNoTax: '1.01333', coverMonthlyPriceTax: '0.81333' },
    { id: IDS[3], partner: partnerCode, roomCount: roomCount, cover: 'DDEAUX_FAKE', coverMonthlyPrice: '3.84417', pricingZone: 'ZNOTFOUND', coverMonthlyPriceNoTax: '1.01333', coverMonthlyPriceTax: '0.81333' },
    { id: IDS[4], partner: partnerCode, roomCount: roomCount, cover: 'INCEND_FAKE', coverMonthlyPrice: '4.84417', pricingZone: 'ZNOTFOUND', coverMonthlyPriceNoTax: '1.01333', coverMonthlyPriceTax: '0.81333' },
    { id: IDS[5], partner: partnerCode, roomCount: roomCount, cover: 'VOLXXX_FAKE', coverMonthlyPrice: '5.84417', pricingZone: 'ZNOTFOUND', coverMonthlyPriceNoTax: '1.01333', coverMonthlyPriceTax: '0.81333' }
  ])
}

export async function clearPricingMatrixSqlFixture () {
  await PricingMatrixSqlModel.destroy({ where: { id: IDS } })
}
