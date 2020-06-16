import { expect, sinon } from '../../../test-utils'
import { Partner } from '../../../../src/app/partner/domain/partner'
import { GetPartnerById } from '../../../../src/app/partner/domain/get-partner-by-id.usecase'

describe('Get Partner Information', async () => {
  it('should return requested partner information', async () => {
    // GIVEN
    const expectedInformation: Partner = { key: 'myPartner' }
    const partnerInformationRepository = { getByKey: sinon.stub() }
    partnerInformationRepository.getByKey.withArgs('myPartner').resolves(expectedInformation)
    const getPartnerInformation : GetPartnerById = GetPartnerById.factory(partnerInformationRepository)

    // WHEN
    const information: Partner = await getPartnerInformation({ partnerId: 'myPartner' })

    // THEN
    expect(information).to.equal(expectedInformation)
  })
})
