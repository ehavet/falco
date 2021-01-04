import { DefaultCapAdvice } from './default-cap-advice'

export interface DefaultCapAdviceRepository {
    get(partnerCode: string, roomCount: number): Promise<DefaultCapAdvice>,
}
