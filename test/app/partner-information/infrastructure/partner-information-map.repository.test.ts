import { expect } from '../../../test-utils'
import { PartnerInformationMapRepository } from '../../../../src/app/partner-information/infrastructure/partner-information-map.repository'
import { PartnerInformationNotFoundError } from '../../../../src/app/partner-information/domain/partner-information.errors'
import { PartnerInformation } from '../../../../src/app/partner-information/domain/partner-information'

const partnerInformationJson = { partnerOne: { key: 'partnerOne' }, partnerTwo: { key: 'partnerTwo' } }
const partnerInformationMapRepository = new PartnerInformationMapRepository(partnerInformationJson)

describe('Partner information Map Repository', async () => {
  describe('getByKey', async () => {
    it('should return partner information by partner key', async () => {
      // WHEN
      const partnerInformation: PartnerInformation = await partnerInformationMapRepository.getByKey('partnerOne')

      // THEN
      expect(partnerInformation).to.deep.equal({ key: 'partnerOne' })
    })

    it('should thrown not found error when partner is not found', async () => {
      // WHEN
      const partnerInformationPromise: Promise<PartnerInformation> = partnerInformationMapRepository.getByKey('unkownPartnerKey')

      // THEN
      expect(partnerInformationPromise).to.be.rejectedWith(PartnerInformationNotFoundError)
    })
  })
})
