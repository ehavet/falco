import { PropertySqlModel } from './property-sql.model'
import { Property } from '../../domain/property'
import { Properties } from '../../domain/properties'

export function sqlToPropertyMapper (propertySql: PropertySqlModel): Property {
  return {
    id: propertySql.id,
    name: propertySql.name
  }
}

export function sqlToPropertiesMapper (propertiesSql: PropertySqlModel[]): Properties {
  return { properties: propertiesSql.map(sqlToPropertyMapper) }
}
