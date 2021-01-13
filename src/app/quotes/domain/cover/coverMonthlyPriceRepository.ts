import { CoverMonthlyPrice } from './coverMonthlyPrice'

export interface CoverMonthlyPriceRepository {
    get(partnerCode: string, roomCount: number): Promise<Array<CoverMonthlyPrice>>
}
