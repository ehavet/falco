import { Quote } from './quote'
import { CreateQuoteCommand } from './create-quote-command'
import { QuoteRepository } from './quote.repository'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'
import { DefaultCapAdviceRepository } from './default-cap-advice/default-cap-advice.repository'
import { CoverMonthlyPriceRepository } from './cover-monthly-price/cover-monthly-price.repository'
import { CoverPricingZoneRepository } from './cover-pricing-zone/cover-pricing-zone.repository'
import { CoverMonthlyPrice } from './cover-monthly-price/cover-monthly-price'
import { getCoverMonthlyPrices } from './quote.func'

export interface CreateQuote {
    (createQuoteCommand: CreateQuoteCommand): Promise<Quote>
}

export namespace CreateQuote {

    export function factory (
      quoteRepository: QuoteRepository,
      partnerRepository: PartnerRepository,
      defaultCapAdviceRepository: DefaultCapAdviceRepository,
      coverMonthlyPriceRepository: CoverMonthlyPriceRepository,
      pricingZoneRepository: CoverPricingZoneRepository
    ): CreateQuote {
      return async (createQuoteCommand: CreateQuoteCommand): Promise<Quote> => {
        const partnerCode = createQuoteCommand.partnerCode
        const { city, postalCode, roomCount } = createQuoteCommand.risk.property
        const partner: Partner = await partnerRepository.getByCode(partnerCode)
        const { productCode } = partner.offer
        const defaultCapAdvice = await defaultCapAdviceRepository.get(partnerCode, roomCount)
        const coverMonthlyPrices: Array<CoverMonthlyPrice> = await getCoverMonthlyPrices(coverMonthlyPriceRepository, pricingZoneRepository, productCode, partnerCode, roomCount, city, postalCode)
        const quote: Quote = Quote.create(createQuoteCommand, partner, defaultCapAdvice, coverMonthlyPrices)
        await quoteRepository.save(quote)
        return quote
      }
    }
}
