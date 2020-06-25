import { expect, sinon } from '../../../test-utils'
import { Partner, QuestionCode } from '../../../../src/app/partners/domain/partner'
import { GetPartnerByCode } from '../../../../src/app/partners/domain/get-partner-by-code.usecase'

describe('Get partner by code', async () => {
  it('should return requested partner', async () => {
    // GIVEN
    const expectedPartner: Partner = {
      code: 'myPartner',
      translationKey: 'myPartnerTranslationKey',
      questions: [{
        code: QuestionCode.RoomCount,
        required: true,
        options: {
          list: [1, 2]
        }
      }]
    }

    const partnerRepository = { getByCode: sinon.stub() }
    partnerRepository.getByCode.withArgs('myPartner').resolves(expectedPartner)
    const getPartnerByCode : GetPartnerByCode = GetPartnerByCode.factory(partnerRepository)

    // WHEN
    const partner: Partner = await getPartnerByCode({ partnerCode: 'myPartner' })

    // THEN
    expect(partner).to.equal(expectedPartner)
  })
})
