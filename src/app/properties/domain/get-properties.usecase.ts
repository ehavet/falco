import { Properties } from './properties'
import { PropertyRepository } from './property.repository'

export interface GetProperties {
    () : Promise<Properties>
}

export namespace GetProperties {

    export function factory (propertyRepository: PropertyRepository): GetProperties {
      return async () => {
        return await propertyRepository.getAll()
      }
    }
}
