import { Partner } from './partner'
import { PartnerRepository } from './partner.repository'
import { GetPartnerByIdParams } from './get-partner-by-id-params'

export interface GetPartnerById {
    (getPartnerByIdParams: GetPartnerByIdParams) : Promise<Partner>
}

export namespace GetPartnerById {

    export function factory (partnerRepository: PartnerRepository): GetPartnerById {
      return async (getPartnerByIdParams: GetPartnerByIdParams) => {
        return await partnerRepository.getByKey(getPartnerByIdParams.partnerId)
      }
    }
}
