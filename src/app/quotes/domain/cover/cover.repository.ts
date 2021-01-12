import { Cover } from './cover'

export interface CoverRepository {
    getCovers(partnerCode: string, roomCount: number): Promise<Array<Cover>>
}
