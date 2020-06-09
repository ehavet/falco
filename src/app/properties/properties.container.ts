import routes from './api/v0/properties.api'
import { GetProperties } from './domain/get-properties.usecase'
import { PropertyRepository } from './domain/property.repository'
import { PropertySqlRepository } from './infrastructure/property-sql.repository'

export interface Container {
  GetProperties: GetProperties
}

const propertyRepository: PropertyRepository = new PropertySqlRepository()
const getProperties: GetProperties = GetProperties.factory(propertyRepository)

export const container: Container = {
  GetProperties: getProperties
}

export function propertiesRoutes () {
  return routes(container)
}
