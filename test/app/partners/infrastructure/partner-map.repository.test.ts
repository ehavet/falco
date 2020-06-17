import { expect } from '../../../test-utils'
import { PartnerMapRepository } from '../../../../src/app/partners/infrastructure/partner-map.repository'
import { PartnerNotFoundError } from '../../../../src/app/partners/domain/partner.errors'
import { Partner } from '../../../../src/app/partners/domain/partner'

const partnerJson = { partnerOne: { code: 'partnerOne', translationKey: 'translationKey' }, partnerTwo: { code: 'partnerTwo', translationKey: 'translationKey' } }
const partnerMapRepository = new PartnerMapRepository(partnerJson)

describe('Partner Map Repository', async () => {
  describe('getByCode', async () => {
    it('should return partner by partner code', async () => {
      // WHEN
      const partner: Partner = await partnerMapRepository.getByCode('partnerOne')

      // THEN
      expect(partner).to.deep.equal({ code: 'partnerOne', translationKey: 'translationKey' })
    })

    it('should thrown not found error when partner is not found', async () => {
      // WHEN
      const partnerPromise: Promise<Partner> = partnerMapRepository.getByCode('unkownPartnerCode')

      // THEN
      expect(partnerPromise).to.be.rejectedWith(PartnerNotFoundError)
    })
  })
})
