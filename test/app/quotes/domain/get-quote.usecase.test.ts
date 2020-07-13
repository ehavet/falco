import { expect, sinon } from '../../../test-utils'
import { GetQuote } from '../../../../src/app/quotes/domain/get-quote.usecase'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { GetQuoteQuery } from '../../../../src/app/quotes/domain/get-quote-query'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { NoPartnerInsuranceForRiskError } from '../../../../src/app/quotes/domain/quote.errors'

describe('Usecase - Get Quote', async () => {
  let getQuote
  const quoteRepository = { save: sinon.mock(), get: sinon.stub() }
  const partnerRepository = { getByCode: sinon.stub(), getOffer: sinon.stub(), getCallbackUrl: sinon.stub() }
  const partnerOffer : Partner.Offer = {
    pricingMatrix: new Map([
      [1, { monthlyPrice: 4.39, defaultDeductible: 120, defaultCeiling: 5000 }],
      [2, { monthlyPrice: 5.82, defaultDeductible: 150, defaultCeiling: 7000 }]
    ]),
    simplifiedCovers: ['ACDDE', 'ACVOL'],
    productCode: 'MRH_Etudiant',
    productVersion: '1.0',
    contractualTerms: '/path/to/contractual/terms',
    ipid: '/path/to/ipid'
  }
  const expectedQuote: Quote = {
    id: '',
    partnerCode: 'myPartner',
    risk: {
      property: {
        roomCount: 2
      }
    },
    insurance: {
      estimate: {
        monthlyPrice: 5.82,
        defaultDeductible: 150,
        defaultCeiling: 7000
      },
      currency: 'EUR',
      simplifiedCovers: ['ACDDE', 'ACVOL'],
      productCode: 'MRH_Etudiant',
      productVersion: '1.0',
      contractualTerms: '/path/to/contractual/terms',
      ipid: '/path/to/ipid'
    }
  }

  beforeEach(() => {
    partnerRepository.getOffer.withArgs('myPartner').returns(partnerOffer)
    getQuote = GetQuote.factory(quoteRepository, partnerRepository)
  })

  afterEach(() => {
    quoteRepository.save.reset()
  })

  describe('should return the quote', async () => {
    it('with the partner code and the risk', async () => {
      // Given
      quoteRepository.save.resolves()

      // When
      const quote: Quote = await getQuote({ partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } })

      // Then
      expect(quote).to.deep.include({ partnerCode: expectedQuote.partnerCode })
      expect(quote).to.deep.include({ risk: expectedQuote.risk })
    })

    it('with the insurance', async () => {
      // Given
      const getQuoteQuery: GetQuoteQuery = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }
      const expectedInsurance: Quote.Insurance = expectedQuote.insurance

      quoteRepository.save.resolves()

      // When
      const quote: Quote = await getQuote(getQuoteQuery)

      // Then
      expect(quote).to.deep.include({ insurance: expectedInsurance })
    })

    describe('with a generated alphanumerical id that', async () => {
      it('has 7 characters', async () => {
        // Given
        const getQuoteQuery: GetQuoteQuery = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }

        quoteRepository.save.resolves()

        // When
        const quote: Quote = await getQuote(getQuoteQuery)

        // Then
        expect(quote.id.length).to.equal(7)
      })

      it('has no I nor l nor O nor 0', async () => {
        // Given
        const getQuoteQuery: GetQuoteQuery = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }

        quoteRepository.save.resolves()

        // When
        const quote: Quote = await getQuote(getQuoteQuery)

        // Then
        expect(quote.id).to.not.have.string('O')
        expect(quote.id).to.not.have.string('I')
        expect(quote.id).to.not.have.string('l')
        expect(quote.id).to.not.have.string('0')
      })

      it('is returned within the quote', async () => {
        // Given
        const getQuoteQuery: GetQuoteQuery = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }

        quoteRepository.save.resolves()

        // When
        const quote: Quote = await getQuote(getQuoteQuery)

        // Then
        expect(quote).to.include.keys('id')
      })
    })
  })

  it('should save the quote', async () => {
    // Given
    const getQuoteQuery: GetQuoteQuery = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }
    quoteRepository.save.resolves()

    // When
    const quote = await getQuote(getQuoteQuery)

    // Then
    const saveSpy = quoteRepository.save.getCall(0)
    expectedQuote.id = quote.id
    return expect(saveSpy.calledWith(expectedQuote)).to.be.true
  })

  it('should throw an error if there is no insurance for the given risk', async () => {
    // Given
    const getQuoteQuery: GetQuoteQuery = { partnerCode: 'myPartner', risk: { property: { roomCount: 3 } } }

    // When
    const quotePromise = getQuote(getQuoteQuery)

    // Then
    return expect(quotePromise)
      .to.be.rejectedWith(
        NoPartnerInsuranceForRiskError,
        'Partner with code myPartner does not have an insurance for risk {"property":{"roomCount":3}}'
      )
  })
})
