import { DefaultCapAdviceRepository } from '../../domain/default-cap-advice/default-cap-advice.repository'
import { DefaultCapAdviceSqlModel } from './default-cap-advice-sql.model'
import { DefaultCapAdvice } from '../../domain/default-cap-advice/default-cap-advice'
import {
  DefaultCapAdviceNotFoundError,
  MultipleDefaultCapAdviceFoundError
} from '../../domain/default-cap-advice/default-cap-advice.errors'
import { Amount } from '../../../common-api/domain/amount/amount'

export class DefaultCapAdviceSqlRepository implements DefaultCapAdviceRepository {
  async get (partnerCode: string, roomCount: number): Promise<DefaultCapAdvice> {
    const result = await DefaultCapAdviceSqlModel.findAll({ where: { partnerCode: partnerCode, roomCount: roomCount } })

    if (result.length === 0) throw new DefaultCapAdviceNotFoundError(partnerCode, roomCount)
    if (result.length > 1) throw new MultipleDefaultCapAdviceFoundError(partnerCode, roomCount)

    return { value: Amount.toAmount(result[0].defaultCapAdvice) }
  }
}
