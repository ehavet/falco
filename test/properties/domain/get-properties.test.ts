import { expect, sinon } from '../../test-utils'
import { Properties } from '../../../src/properties/domain/properties'
import { GetProperties } from '../../../src/properties/domain/get-properties.usecase'

describe('Get Properties', async () => {
  it('should return the stored properties', async () => {
    // GIVEN
    const expectedProperties: Properties = { properties: [{ id: 1, name: 'T1' }] }
    const propertyRepository = {
      getAll: sinon.stub().resolves(expectedProperties)
    }
    const getProperties : GetProperties = GetProperties.factory(propertyRepository)

    // WHEN
    const properties: Properties = await getProperties()

    // THEN
    expect(properties).to.equal(expectedProperties)
  })
})
