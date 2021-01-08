import routes from './api/v0/partners.api'
import partnerJson from '../../data/partners.json'
import { GetPartnerByCode } from './domain/get-partner-by-code.usecase'
import { PartnerMapRepository } from './infrastructure/partner-map.repository'
import { PartnerRepository } from './domain/partner.repository'
import { PricingMatrixSqlModel } from './infrastructure/sql-models/pricing-matrix-sql.model'

export interface Container {
  GetPartnerByCode: GetPartnerByCode,
  partnerRepository: PartnerRepository
}

const partnerMapRepository = new PartnerMapRepository(partnerJson)
const getPartnerByCode: GetPartnerByCode = GetPartnerByCode.factory(partnerMapRepository)

export const container: Container = {
  GetPartnerByCode: getPartnerByCode,
  partnerRepository: partnerMapRepository
}

export const partnerSqlModels: Array<any> = [PricingMatrixSqlModel]

export function partnerRoutes () {
  return routes(container)
}
