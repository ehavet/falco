import { expect, sinon } from '../../../test-utils'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { GetPartnerByCode } from '../../../../src/app/partners/domain/get-partner-by-code.usecase'

describe('Partners - Usecase - Get partner by code', async () => {
  it('should return requested partner', async () => {
    // GIVEN
    const expectedPartner: Partner = {
      code: 'myPartner',
      translationKey: 'myPartnerTranslationKey',
      callbackUrl: 'http://myPartner-callback.com',
      questions: [{
        code: Partner.Question.QuestionCode.RoomCount,
        options: {
          list: [1, 2]
        }
      },
      {
        code: Partner.Question.QuestionCode.Roommate,
        applicable: true
      }
      ]
    }

    const partnerRepository = { getByCode: sinon.stub(), getOffer: sinon.stub(), getCallbackUrl: sinon.stub(), getOperationCodes: sinon.stub() }
    partnerRepository.getByCode.withArgs('myPartner').resolves(expectedPartner)
    const getPartnerByCode : GetPartnerByCode = GetPartnerByCode.factory(partnerRepository)

    // WHEN
    const partner: Partner = await getPartnerByCode({ partnerCode: 'myPartner' })

    // THEN
    expect(partner).to.equal(expectedPartner)
  })
})
