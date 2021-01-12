import { Partner } from '../domain/partner'
import { PartnerRepository } from '../domain/partner.repository'
import { PartnerNotFoundError, PartnerPricingMatrixNotFoundError } from '../domain/partner.errors'
import { buildPartner } from './partner.builder'
import { OperationCode } from '../../common-api/domain/operation-code'
import { PricingMatrixSqlModel } from './sql-models/pricing-matrix-sql.model'

const objectToMap = object => {
  const map = new Map<string, any>()
  Object.keys(object).forEach(async key => {
    map.set(key, object[key])
  })
  return map
}

export class PartnerMapRepository implements PartnerRepository {
  private partnerJsonMap: Map<string, Partial<Partner>>

  constructor (jsonFile) {
    this.partnerJsonMap = objectToMap(jsonFile)
  }

  async getByCode (partnerCode: string): Promise<Partner> {
    if (!this.partnerJsonMap.has(partnerCode)) throw new PartnerNotFoundError(partnerCode)

    const pricingMatrixArray = await PricingMatrixSqlModel.findAll({ where: { partner: partnerCode } })
    if (pricingMatrixArray.length > 0) {
      return await buildPartner(this.partnerJsonMap.get(partnerCode)!, pricingMatrixArray)
    }

    throw new PartnerPricingMatrixNotFoundError(partnerCode)
  }

  async getCallbackUrl (partnerCode: string): Promise<string> {
    const partner: Partner = await this.getByCode(partnerCode)
    return Promise.resolve(partner.callbackUrl)
  }

  async getOperationCodes (partnerCode: string): Promise<Array<OperationCode>> {
    const partner: Partner = await this.getByCode(partnerCode)
    return Promise.resolve(partner.offer!.operationCodes)
  }
}
