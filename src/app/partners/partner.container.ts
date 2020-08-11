import routes from './api/v0/partners.api'
import partnerJson from '../../data/partners.json'
import { GetPartnerByCode } from './domain/get-partner-by-code.usecase'
import { PartnerMapRepository } from './infrastructure/partner-map.repository'
import { PartnerRepository } from './domain/partner.repository'
import { DoesPartnerAllowRoommates } from './domain/does-partner-allow-roommates.usecase'

export interface Container {
  GetPartnerByCode: GetPartnerByCode,
  DoesPartnerAllowRoommates: DoesPartnerAllowRoommates,
  partnerRepository: PartnerRepository
}

const partnerMapRepository = new PartnerMapRepository(partnerJson)
const getPartnerByCode: GetPartnerByCode = GetPartnerByCode.factory(partnerMapRepository)
const doesPartnerAllowRoommates: DoesPartnerAllowRoommates = DoesPartnerAllowRoommates.factory(partnerMapRepository)

export const container: Container = {
  GetPartnerByCode: getPartnerByCode,
  DoesPartnerAllowRoommates: doesPartnerAllowRoommates,
  partnerRepository: partnerMapRepository
}

export function partnerRoutes () {
  return routes(container)
}
