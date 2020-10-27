import { Quote } from './quote'
import { CreateQuoteCommand } from './create-quote-command'
import { QuoteRepository } from './quote.repository'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'

export interface CreateQuote {
    (createQuoteCommand: CreateQuoteCommand): Promise<Quote>
}

export namespace CreateQuote {

    export function factory (quoteRepository: QuoteRepository, partnerRepository: PartnerRepository): CreateQuote {
      return async (createQuoteCommand: CreateQuoteCommand): Promise<Quote> => {
        const partnerCode = createQuoteCommand.partnerCode
        const partnerOffer: Partner.Offer = await partnerRepository.getOffer(partnerCode)
        const quote: Quote = Quote.create(createQuoteCommand, partnerOffer)
        await quoteRepository.save(quote)
        return quote
      }
    }
}
