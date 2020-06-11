import { PartnerInformation } from '../domain/partner-information'
import { PartnerInformationRepository } from '../domain/partner-information.repository'
import { PartnerInformationNotFoundError } from '../domain/partner-information.errors'

const objectToMap = object => {
  const map = new Map<string, PartnerInformation>()
  Object.keys(object).forEach(key => {
    map.set(key, object[key])
  })
  return map
}

export class PartnerInformationMapRepository implements PartnerInformationRepository {
  private partnerMap: Map<string, PartnerInformation>

  constructor (jsonFile) {
    this.partnerMap = objectToMap(jsonFile)
  }

  async getByKey (partnerKey: string): Promise<PartnerInformation> {
    if (this.partnerMap.has(partnerKey)) {
      return Promise.resolve(this.partnerMap.get(partnerKey) || {})
    }

    throw new PartnerInformationNotFoundError(partnerKey)
  }
}
