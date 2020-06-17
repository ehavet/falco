import { Partner } from '../domain/partner'
import { PartnerRepository } from '../domain/partner.repository'
import { PartnerNotFoundError } from '../domain/partner.errors'

const objectToMap = object => {
  const map = new Map<string, Partner>()
  Object.keys(object).forEach(key => {
    map.set(key, object[key])
  })
  return map
}

export class PartnerMapRepository implements PartnerRepository {
  private partnerMap: Map<string, Partner>

  constructor (jsonFile) {
    this.partnerMap = objectToMap(jsonFile)
  }

  async getByKey (partnerKey: string): Promise<Partner> {
    if (this.partnerMap.has(partnerKey)) {
      return Promise.resolve(this.partnerMap.get(partnerKey)!)
    }

    throw new PartnerNotFoundError(partnerKey)
  }
}
