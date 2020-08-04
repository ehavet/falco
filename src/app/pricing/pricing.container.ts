import { ComputePriceWithOperationCode } from './domain/compute-price-with-operation-code.usecase'
import { PolicyRepository } from '../policies/domain/policy.repository'
import { PolicySqlRepository } from '../policies/infrastructure/policy-sql.repository'
import { PartnerRepository } from '../partners/domain/partner.repository'
import { container as partnerContainer } from '../partners/partner.container'
import routes from '../pricing/api/v0/pricing.api'
import { logger } from '../../libs/logger'

export interface Container {
    ComputePriceWithOperationCode: ComputePriceWithOperationCode
}

const policyRepository: PolicyRepository = new PolicySqlRepository()
const partnerRepository: PartnerRepository = partnerContainer.partnerRepository
const computePriceWithOperationCode: ComputePriceWithOperationCode = ComputePriceWithOperationCode.factory(policyRepository, partnerRepository)

export const container: Container = {
  ComputePriceWithOperationCode: computePriceWithOperationCode
}

export function pricingRoutes () {
  return routes(container, logger)
}
