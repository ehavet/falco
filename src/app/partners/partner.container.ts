import routes from './api/v0/partners.api'
import partnerJson from '../../data/partners.json'
import { GetPartnerByCode } from './domain/get-partner-by-code.usecase'
import { PartnerMapRepository } from './infrastructure/partner-map.repository'

export interface Container {
  GetPartnerByCode: GetPartnerByCode
}

const partnerMapRepository = new PartnerMapRepository(partnerJson)
const getPartnerByCode: GetPartnerByCode = GetPartnerByCode.factory(partnerMapRepository)

export const container: Container = {
  GetPartnerByCode: getPartnerByCode
}

export function partnerRoutes () {
  return routes(container)
}
