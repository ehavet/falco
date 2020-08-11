import { PartnerRepository } from './partner.repository'
import { Partner } from './partner'
import * as PartnerFunc from './partner.func'

export interface DoesPartnerAllowRoommates {
    (doesPartnerAllowRoommatesQuery: DoesPartnerAllowRoommatesQuery) : Promise<boolean>
}

export interface DoesPartnerAllowRoommatesQuery {
    partnerCode: string
}

export namespace DoesPartnerAllowRoommates {

    export function factory (partnerRepository: PartnerRepository): DoesPartnerAllowRoommates {
      return async (query: DoesPartnerAllowRoommatesQuery) : Promise<boolean> => {
        const partnerCode: string = query.partnerCode
        const partner: Partner = await partnerRepository.getByCode(partnerCode)
        return PartnerFunc.doesPartnerAllowRoommates(partner)
      }
    }
}
