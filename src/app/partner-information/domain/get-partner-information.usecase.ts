import { PartnerInformation } from './partner-information'
import { PartnerInformationRepository } from './partner-information.repository'
import { GetPartnerInformationQuery } from './get-partner-information-query'

export interface GetPartnerInformation {
    (getPartnerInformationQuery: GetPartnerInformationQuery) : Promise<PartnerInformation>
}

export namespace GetPartnerInformation {

    export function factory (partnerInformationRepository: PartnerInformationRepository): GetPartnerInformation {
      return async (getPartnerInformationQuery: GetPartnerInformationQuery) => {
        return await partnerInformationRepository.getByName(getPartnerInformationQuery.name)
      }
    }
}
