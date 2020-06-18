import { Partner } from './partner'
import { PartnerRepository } from './partner.repository'
import { GetPartnerByCodeQuery } from './get-partner-by-code-query'

export interface GetPartnerByCode {
    (getPartnerByCodeQuery: GetPartnerByCodeQuery) : Promise<Partner>
}

export namespace GetPartnerByCode {

    export function factory (partnerRepository: PartnerRepository): GetPartnerByCode {
      return async (getPartnerByCodeQuery: GetPartnerByCodeQuery) => {
        return await partnerRepository.getByCode(getPartnerByCodeQuery.partnerCode)
      }
    }
}
