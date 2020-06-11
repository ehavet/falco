import { expect, sinon } from '../../../test-utils'
import { PartnerInformation } from '../../../../src/app/partner-information/domain/partner-information'
import { GetPartnerInformation } from '../../../../src/app/partner-information/domain/get-partner-information.usecase'

describe('Get Partner Information', async () => {
  it('should return requested partner information', async () => {
    // GIVEN
    const expectedInformation: PartnerInformation = { key: 'myPartner' }
    const partnerInformationRepository = { getByKey: sinon.stub() }
    partnerInformationRepository.getByKey.withArgs('myPartner').resolves(expectedInformation)
    const getPartnerInformation : GetPartnerInformation = GetPartnerInformation.factory(partnerInformationRepository)

    // WHEN
    const information: PartnerInformation = await getPartnerInformation({ partnerKey: 'myPartner' })

    // THEN
    expect(information).to.equal(expectedInformation)
  })
})
