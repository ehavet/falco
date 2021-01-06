import { PricingMatrixSqlModel } from '../../../../src/app/partners/infrastructure/sql-models/pricing-matrix-sql.model'
import { dbTestUtils } from '../../../utils/db.test-utils'

const IDS = [
  'e6a28abf-fa97-42dd-b9b3-4dbe7a33f839',
  '713d1c20-998b-4d6b-bf3c-2ab7e1362d34',
  '87d3f0ea-a99b-4c9a-8a5f-a8cc6c6fee35',
  '87d3f0ea-a99b-4c9a-8a5f-a8cc6c6fee37',
  '87d3f0ea-a99b-4c9a-8a5f-a8cc6c6fee39',
  '87d3f0ea-a99b-4c9a-8a5f-a8cc6c6fee40',
  '309836c2-8a36-4553-b2f8-b25fe675855d',
  '8805a367-e4b1-4665-a50a-7683d3b2864f',
  '14900905-6e3e-43a0-af28-87cb3eca3bc4',
  '4de9bc3e-c915-4d5a-a5f5-3bd076f20db9',
  '1bf3b857-9292-4d98-b464-b47c6058af2a',
  '4754812c-9bc6-483d-bbbe-4f501481fe11'
]

export async function populatePricingMatrixSqlFixture () {
  await dbTestUtils.initDB()
  const pricingMatrix = [
    { id: IDS[0], partner: 'partnerOne', roomCount: 1, coverMonthlyPrice: 3.30 },
    { id: IDS[1], partner: 'partnerTwo', roomCount: 1, coverMonthlyPrice: 4.52 },
    { id: IDS[2], partner: 'partnerTwo', roomCount: 2, coverMonthlyPrice: 6.95 },
    { id: IDS[3], partner: 'studyo', roomCount: 1, coverMonthlyPrice: 6.00 },
    { id: IDS[4], partner: 'studyo', roomCount: 2, coverMonthlyPrice: 7.50 },
    { id: IDS[5], partner: 'studyo', roomCount: 3, coverMonthlyPrice: 10.00 },
    { id: IDS[6], partner: 'essca', roomCount: 1, coverMonthlyPrice: 6.34 },
    { id: IDS[7], partner: 'essca', roomCount: 2, coverMonthlyPrice: 6.34 },
    { id: IDS[8], partner: 'essca', roomCount: 3, coverMonthlyPrice: 6.34 },
    { id: IDS[9], partner: 'demo-student', roomCount: 1, coverMonthlyPrice: 6.00 },
    { id: IDS[10], partner: 'demo-student', roomCount: 2, coverMonthlyPrice: 7.50 },
    { id: IDS[11], partner: 'demo-student', roomCount: 3, coverMonthlyPrice: 10.00 }
  ]
  await PricingMatrixSqlModel.bulkCreate(pricingMatrix)
}

export async function resetPricingMatrixSqlFixture () {
  await PricingMatrixSqlModel.destroy({
    where: { id: IDS },
    cascade: true
  })
}
