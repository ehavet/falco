import { Properties } from './properties'

export interface PropertyRepository {
    getAll(): Promise<Properties>
}
