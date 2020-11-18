import { expect } from '../../../test-utils'
import { createQuoteFixture } from '../fixtures/quote.fixture'
import { quoteRepositoryStub } from '../fixtures/quote-repository.test-doubles'
import { GetQuoteById } from '../../../../src/app/quotes/domain/get-quote-by-id.usecase'
import { QuoteNotFoundError } from '../../../../src/app/quotes/domain/quote.errors'

describe('Quotes - Usecase - Get Quote by Id', async () => {
  it('should return the found quote', async () => {
    // Given
    const storedQuote = createQuoteFixture()
    const quoteRepository = quoteRepositoryStub()
    quoteRepository.get.withArgs(storedQuote.id).resolves(storedQuote)

    const getQuoteById = GetQuoteById.factory(quoteRepository)

    // When
    const foundQuote = await getQuoteById({ quoteId: storedQuote.id })

    // Then
    expect(foundQuote).to.deep.equal(storedQuote)
  })

  it('should throw a QuoteNotFoundError when the quote is not found', async () => {
    // Given
    const unknownQuoteId: string = 'UNKNOWN'
    const quoteRepository = quoteRepositoryStub()
    quoteRepository.get.withArgs(unknownQuoteId).rejects(new QuoteNotFoundError(unknownQuoteId))

    const getQuoteById = GetQuoteById.factory(quoteRepository)

    // When
    const promise = getQuoteById({ quoteId: unknownQuoteId })

    // Then
    return expect(promise).to.be.rejectedWith(QuoteNotFoundError)
  })
})
