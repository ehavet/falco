import { DefaultCapAdviceRepository } from '../../domain/default-cap-advice/default-cap-advice.repository'

export class DefaultCapAdviceSqlRepository implements DefaultCapAdviceRepository {
  // @ts-ignore
  async get (partnerCode: string, roomCount: number): Promise<DefaultCapAdvice> {
    throw new Error('Not implemented yet')
  }
}
