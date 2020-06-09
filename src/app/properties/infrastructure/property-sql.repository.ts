import { PropertyRepository } from '../domain/property.repository'
import { PropertySqlModel } from './model/property-sql.model'
import { Properties } from '../domain/properties'
import { sqlToPropertiesMapper } from './model/property-sql.mapper'

export class PropertySqlRepository implements PropertyRepository {
  async getAll (): Promise<Properties> {
    const propertySqlModels = await PropertySqlModel.findAll()

    if (!propertySqlModels) {
      return { properties: [] }
    }
    return sqlToPropertiesMapper(propertySqlModels)
  }
}
