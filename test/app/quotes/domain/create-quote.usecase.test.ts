import { expect, sinon } from '../../../test-utils'
import { Quote } from '../../../../src/app/quotes/domain/quote'
import { CreateQuoteCommand } from '../../../../src/app/quotes/domain/create-quote-command'
import { Partner } from '../../../../src/app/partners/domain/partner'
import { QuoteRiskPropertyRoomCountNotInsurableError } from '../../../../src/app/quotes/domain/quote.errors'
import { CreateQuote } from '../../../../src/app/quotes/domain/create-quote.usecase'

describe('Quotes - Usecase - Create Quote', async () => {
  let createQuote
  const quoteRepository = { save: sinon.mock(), get: sinon.stub(), update: sinon.stub }
  const partnerRepository = { getByCode: sinon.stub(), getOffer: sinon.stub(), getCallbackUrl: sinon.stub(), getOperationCodes: sinon.stub() }
  const partnerOffer : Partner.Offer = {
    pricingMatrix: new Map([
      [1, { monthlyPrice: 4.39, defaultDeductible: 120, defaultCeiling: 5000 }],
      [2, { monthlyPrice: 5.82, defaultDeductible: 150, defaultCeiling: 7000 }]
    ]),
    simplifiedCovers: ['ACDDE', 'ACVOL'],
    productCode: 'MRH_Etudiant',
    productVersion: '1.0',
    contractualTerms: '/path/to/contractual/terms',
    ipid: '/path/to/ipid',
    operationCodes: []
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
    },
    nbMonthsDue: 12,
    premium: 69.84
  }

  beforeEach(() => {
    partnerRepository.getOffer.withArgs('myPartner').returns(partnerOffer)
    createQuote = CreateQuote.factory(quoteRepository, partnerRepository)
  })

  afterEach(() => {
    quoteRepository.save.reset()
  })

  describe('should return the quote', async () => {
    it('with the partner code and the risk', async () => {
      // Given
      quoteRepository.save.resolves()

      // When
      const quote: Quote = await createQuote({ partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } })

      // Then
      expect(quote).to.deep.include({ partnerCode: expectedQuote.partnerCode })
      expect(quote).to.deep.include({ risk: expectedQuote.risk })
    })

    it('with the insurance', async () => {
      // Given
      const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }
      const expectedInsurance: Quote.Insurance = expectedQuote.insurance

      quoteRepository.save.resolves()

      // When
      const quote: Quote = await createQuote(createQuoteCommand)

      // Then
      expect(quote).to.deep.include({ insurance: expectedInsurance })
    })

    describe('with a generated alphanumerical id that', async () => {
      it('has 7 characters', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }

        quoteRepository.save.resolves()

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote.id.length).to.equal(7)
      })

      it('has no I nor l nor O nor 0', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }

        quoteRepository.save.resolves()

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote.id).to.not.have.string('O')
        expect(quote.id).to.not.have.string('I')
        expect(quote.id).to.not.have.string('l')
        expect(quote.id).to.not.have.string('0')
      })

      it('is returned within the quote', async () => {
        // Given
        const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }

        quoteRepository.save.resolves()

        // When
        const quote: Quote = await createQuote(createQuoteCommand)

        // Then
        expect(quote).to.include.keys('id')
      })
    })
  })

  it('should save the quote', async () => {
    // Given
    const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', risk: { property: { roomCount: 2 } } }
    quoteRepository.save.resolves()

    // When
    const quote = await createQuote(createQuoteCommand)

    // Then
    const saveSpy = quoteRepository.save.getCall(0)
    expectedQuote.id = quote.id
    return expect(saveSpy.calledWith(expectedQuote)).to.be.true
  })

  it('should throw an error if there is no insurance for the given risk', async () => {
    // Given
    const createQuoteCommand: CreateQuoteCommand = { partnerCode: 'myPartner', risk: { property: { roomCount: 3 } } }

    // When
    const quotePromise = createQuote(createQuoteCommand)

    // Then
    return expect(quotePromise)
      .to.be.rejectedWith(
        QuoteRiskPropertyRoomCountNotInsurableError,
        '3 room(s) property is not insurable'
      )
  })
})