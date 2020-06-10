import routes from './api/v0/partner-information.api'
import partnerInformationJson from '../../data/partner-information.json'
import { GetPartnerInformation } from './domain/get-partner-information.usecase'
import { PartnerInformationMapRepository } from './infrastructure/partner-information-map.repository'

export interface Container {
  GetPartnerInformation: GetPartnerInformation
}

const partnerInformationMapRepository = new PartnerInformationMapRepository(partnerInformationJson)
const getPartnerInformation: GetPartnerInformation = GetPartnerInformation.factory(partnerInformationMapRepository)

export const container: Container = {
  GetPartnerInformation: getPartnerInformation
}

export function partnerInformationRoutes () {
  return routes(container)
}
