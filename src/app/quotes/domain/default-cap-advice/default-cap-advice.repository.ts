export interface DefaultCapAdviceRepository {
    get(partnerCode: string, roomCount: number): Promise<DefaultCapAdvice>,
}
