import { Quote } from './quote'
import { QuoteRepository } from './quote.repository'

export interface GetQuoteById {
    (getQuoteByIdQuery: GetQuoteById.GetQuoteByIdQuery): Promise<Quote>
}

export namespace GetQuoteById {

    export interface GetQuoteByIdQuery {
        quoteId: string
    }

    export function factory (quoteRepository: QuoteRepository): GetQuoteById {
      return async (getQuoteByIdQuery: GetQuoteByIdQuery): Promise<Quote> => {
        return quoteRepository.get(getQuoteByIdQuery.quoteId)
      }
    }
}
