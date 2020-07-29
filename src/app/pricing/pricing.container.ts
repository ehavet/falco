import { ComputePriceWithOperationalCode } from './domain/compute-price-with-operational-code.usecase'
import { PolicyRepository } from '../policies/domain/policy.repository'
import { PolicySqlRepository } from '../policies/infrastructure/policy-sql.repository'
import { PartnerRepository } from '../partners/domain/partner.repository'
import { container as partnerContainer } from '../partners/partner.container'

export interface Container {
    ComputePriceWithOperationalCode: ComputePriceWithOperationalCode
}

const policyRepository: PolicyRepository = new PolicySqlRepository()
const partnerRepository: PartnerRepository = partnerContainer.partnerRepository
const computePriceWithOperationalCode = ComputePriceWithOperationalCode.factory(policyRepository, partnerRepository)

export const container: Container = {
  ComputePriceWithOperationalCode: computePriceWithOperationalCode
}
