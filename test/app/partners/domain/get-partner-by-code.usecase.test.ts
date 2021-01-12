import { expect, sinon } from '../../../test-utils'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { GetPartnerByCode } from '../../../../src/app/partners/domain/get-partner-by-code.usecase'
import { createPartnerFixture } from '../fixtures/partner.fixture'

describe('Partners - Usecase - Get partner by code', async () => {
  it('should return requested partner', async () => {
    // GIVEN
    const expectedPartner: Partner = createPartnerFixture()

    const partnerRepository = { getByCode: sinon.stub(), getCallbackUrl: sinon.stub(), getOperationCodes: sinon.stub() }
    partnerRepository.getByCode.withArgs('myPartner').resolves(expectedPartner)
    const getPartnerByCode : GetPartnerByCode = GetPartnerByCode.factory(partnerRepository)

    // WHEN
    const partner: Partner = await getPartnerByCode({ partnerCode: 'myPartner' })

    // THEN
    expect(partner).to.equal(expectedPartner)
  })
})
