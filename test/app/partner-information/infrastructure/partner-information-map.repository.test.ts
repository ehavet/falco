import { expect } from '../../../test-utils'
import { PartnerInformationMapRepository } from '../../../../src/app/partner-information/infrastructure/partner-information-map.repository'
import { PartnerInformationNotFoundError } from '../../../../src/app/partner-information/domain/partner-information.errors'
import { PartnerInformation } from '../../../../src/app/partner-information/domain/partner-information'

const partnerInformationJson = { partnerOne: {}, partnerTwo: {} }
const partnerInformationMapRepository = new PartnerInformationMapRepository(partnerInformationJson)

describe('Partner information Map Repository', async () => {
  describe('getByName', async () => {
    it('should return partner information by partner name', async () => {
      // WHEN
      const partnerInformation: PartnerInformation = await partnerInformationMapRepository.getByName('partnerOne')

      // THEN
      expect(partnerInformation).to.deep.equal({})
    })

    it('should thrown not found error when partner is not found', async () => {
      // WHEN
      const partnerInformationPromise: Promise<PartnerInformation> = partnerInformationMapRepository.getByName('unkownPartnerName')

      // THEN
      expect(partnerInformationPromise).to.be.rejectedWith(PartnerInformationNotFoundError)
    })
  })
})
