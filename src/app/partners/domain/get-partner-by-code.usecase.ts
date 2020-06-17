import { Partner } from './partner'
import { PartnerRepository } from './partner.repository'
import { GetPartnerByCodeQuery } from './get-partner-by-code-query'

export interface GetPartnerByCode {
    (getPartnerByCodeParams: GetPartnerByCodeQuery) : Promise<Partner>
}

export namespace GetPartnerByCode {

    export function factory (partnerRepository: PartnerRepository): GetPartnerByCode {
      return async (getPartnerByCodeParams: GetPartnerByCodeQuery) => {
        return await partnerRepository.getByCode(getPartnerByCodeParams.partnerCode)
      }
    }
}
