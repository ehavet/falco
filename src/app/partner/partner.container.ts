import routes from './api/v0/partner.api'
import partnerInformationJson from '../../data/partner.json'
import { GetPartnerById } from './domain/get-partner-by-id.usecase'
import { PartnerMapRepository } from './infrastructure/partner-map.repository'

export interface Container {
  GetPartnerById: GetPartnerById
}

const partnerInformationMapRepository = new PartnerMapRepository(partnerInformationJson)
const partner: GetPartnerById = GetPartnerById.factory(partnerInformationMapRepository)

export const container: Container = {
  GetPartnerById: partner
}

export function partnerRoutes () {
  return routes(container)
}
