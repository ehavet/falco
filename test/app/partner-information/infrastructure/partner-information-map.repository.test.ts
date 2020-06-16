import { expect } from '../../../test-utils'
import { PartnerMapRepository } from '../../../../src/app/partner/infrastructure/partner-map.repository'
import { PartnerNotFoundError } from '../../../../src/app/partner/domain/partner.errors'
import { Partner } from '../../../../src/app/partner/domain/partner'

const partnerInformationJson = { partnerOne: { key: 'partnerOne' }, partnerTwo: { key: 'partnerTwo' } }
const partnerInformationMapRepository = new PartnerMapRepository(partnerInformationJson)

describe('Partner information Map Repository', async () => {
  describe('getByKey', async () => {
    it('should return partner information by partner key', async () => {
      // WHEN
      const partnerInformation: Partner = await partnerInformationMapRepository.getByKey('partnerOne')

      // THEN
      expect(partnerInformation).to.deep.equal({ key: 'partnerOne' })
    })

    it('should thrown not found error when partner is not found', async () => {
      // WHEN
      const partnerInformationPromise: Promise<Partner> = partnerInformationMapRepository.getByKey('unkownPartnerKey')

      // THEN
      expect(partnerInformationPromise).to.be.rejectedWith(PartnerNotFoundError)
    })
  })
})
