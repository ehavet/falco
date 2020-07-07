import { Quote } from './quote'

export interface QuoteRepository {
    save(quote: Quote): Promise<void>,
    get(quoteId: string): Promise<Quote>
}
