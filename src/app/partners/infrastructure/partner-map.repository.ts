import { Partner } from '../domain/partner'
import { PartnerRepository } from '../domain/partner.repository'
import { PartnerNotFoundError } from '../domain/partner.errors'
import { toPartner } from './json-to-partner.mapper'
import { OperationalCode } from '../../pricing/domain/operational-code'

const objectToMap = object => {
  const map = new Map<string, Partner>()
  Object.keys(object).forEach(key => {
    map.set(key, toPartner(object[key]))
  })
  return map
}

export class PartnerMapRepository implements PartnerRepository {
  private partnerMap: Map<string, Partner>

  constructor (jsonFile) {
    this.partnerMap = objectToMap(jsonFile)
  }

  async getByCode (partnerCode: string): Promise<Partner> {
    if (this.partnerMap.has(partnerCode)) {
      return Promise.resolve(this.partnerMap.get(partnerCode)!)
    }

    throw new PartnerNotFoundError(partnerCode)
  }

  async getOffer (partnerCode: string): Promise<Partner.Offer> {
    const partner: Partner = await this.getByCode(partnerCode)
    // @ts-ignore
    return Promise.resolve(partner.offer)
  }

  async getCallbackUrl (partnerCode: string): Promise<string> {
    const partner: Partner = await this.getByCode(partnerCode)
    return Promise.resolve(partner.callbackUrl)
  }

  // @ts-ignore
  async getOperationalCodes (partnerCode: string): Promise<Array<OperationalCode>> {
    throw new Error('Not implemented Yet')
  }
}
