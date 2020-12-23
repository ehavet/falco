import { Quote } from './quote'
import { CreateQuoteCommand } from './create-quote-command'
import { QuoteRepository } from './quote.repository'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'
import { DefaultCapAdviceRepository } from './default-cap-advice/default-cap-advice.repository'

export interface CreateQuote {
    (createQuoteCommand: CreateQuoteCommand): Promise<Quote>
}

export namespace CreateQuote {

    export function factory (quoteRepository: QuoteRepository, partnerRepository: PartnerRepository, defaultCapAdviceRepository: DefaultCapAdviceRepository): CreateQuote {
      return async (createQuoteCommand: CreateQuoteCommand): Promise<Quote> => {
        const partnerCode = createQuoteCommand.partnerCode
        const partnerOffer: Partner.Offer = await partnerRepository.getOffer(partnerCode)
        const defaultCapAdvice = await defaultCapAdviceRepository.get(partnerCode, createQuoteCommand.risk.property.roomCount)
        const quote: Quote = Quote.create(createQuoteCommand, partnerOffer, defaultCapAdvice)
        await quoteRepository.save(quote)
        return quote
      }
    }
}
