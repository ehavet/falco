import { Quote } from './quote'
import { CreateQuoteCommand } from './create-quote-command'
import { QuoteRepository } from './quote.repository'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'
import { DefaultCapAdviceRepository } from './default-cap-advice/default-cap-advice.repository'
import { CoverMonthlyPriceRepository } from './cover/coverMonthlyPriceRepository'

export interface CreateQuote {
    (createQuoteCommand: CreateQuoteCommand): Promise<Quote>
}

export namespace CreateQuote {

    export function factory (quoteRepository: QuoteRepository, partnerRepository: PartnerRepository, defaultCapAdviceRepository: DefaultCapAdviceRepository, coverMonthlyPriceRepository: CoverMonthlyPriceRepository): CreateQuote {
      return async (createQuoteCommand: CreateQuoteCommand): Promise<Quote> => {
        const partnerCode = createQuoteCommand.partnerCode
        const roomCount = createQuoteCommand.risk.property.roomCount
        const partner: Partner = await partnerRepository.getByCode(partnerCode)
        const defaultCapAdvice = await defaultCapAdviceRepository.get(partnerCode, roomCount)
        const coverMonthlyPrices = await coverMonthlyPriceRepository.get(partnerCode, roomCount)
        const quote: Quote = Quote.create(createQuoteCommand, partner, defaultCapAdvice, coverMonthlyPrices)
        await quoteRepository.save(quote)
        return quote
      }
    }
}
