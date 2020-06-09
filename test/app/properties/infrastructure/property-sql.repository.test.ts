import { PropertySqlModel } from '../../../../src/app/properties/infrastructure/model/property-sql.model'
import { PropertySqlRepository } from '../../../../src/app/properties/infrastructure/property-sql.repository'
import { expect } from '../../../test-utils'

const propertySqlRepository = new PropertySqlRepository()

async function resetDb () {
  await PropertySqlModel.destroy({
    truncate: true
  })
}

describe('Property SQL Repository', async () => {
  const propertySQLFixture1 = {
    id: 1,
    name: 'Property'
  }

  const propertySQLFixture2 = {
    id: 2,
    message: 'Property 2'
  }

  afterEach(async () => {
    await resetDb()
  })

  describe('getAll', async () => {
    it('should return the properties found in database', async () => {
      // GIVEN
      await PropertySqlModel.upsert(propertySQLFixture1)
      await PropertySqlModel.upsert(propertySQLFixture2)

      // WHEN
      const properties = await propertySqlRepository.getAll()

      // THEN
      expect(properties.properties).to.have.lengthOf(2)
    })

    it('should return the mapped properties object', async () => {
      // GIVEN
      await PropertySqlModel.upsert(propertySQLFixture1)

      // WHEN
      const properties = await propertySqlRepository.getAll()

      // THEN
      expect(properties.properties[0]).to.deep.equal(propertySQLFixture1)
    })
  })
})
