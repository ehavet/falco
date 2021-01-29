import { Quote } from './quote'
import { CreateQuoteCommand } from './create-quote-command'
import { QuoteRepository } from './quote.repository'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'
import { DefaultCapAdviceRepository } from './default-cap-advice/default-cap-advice.repository'
import { CoverMonthlyPriceRepository } from './cover-monthly-price/cover-monthly-price.repository'
import { CoverPricingZoneRepository } from './cover-pricing-zone/cover-pricing-zone.repository'
import { CoverPricingZone } from './cover-pricing-zone/cover-pricing-zone'
import * as QuoteFunc from './quote.func'
import { CoverMonthlyPrice } from './cover-monthly-price/cover-monthly-price'

export interface CreateQuote {
    (createQuoteCommand: CreateQuoteCommand): Promise<Quote>
}

export namespace CreateQuote {

    export function factory (
      quoteRepository: QuoteRepository,
      partnerRepository: PartnerRepository,
      defaultCapAdviceRepository: DefaultCapAdviceRepository,
      coverMonthlyPriceRepository: CoverMonthlyPriceRepository,
      coverPricingZoneRepository: CoverPricingZoneRepository
    ): CreateQuote {
      return async (createQuoteCommand: CreateQuoteCommand): Promise<Quote> => {
        const partnerCode = createQuoteCommand.partnerCode
        const { city, postalCode, roomCount } = createQuoteCommand.risk.property
        const partner: Partner = await partnerRepository.getByCode(partnerCode)
        const { productCode } = partner.offer
        const defaultCapAdvice = await defaultCapAdviceRepository.get(partnerCode, roomCount)
        const coverPricingZones: CoverPricingZone[] = await coverPricingZoneRepository.getAllForProductByLocation(productCode, city, postalCode)
        const coverMonthlyPrices: CoverMonthlyPrice[] = await QuoteFunc.getCoverMonthlyPricesFromPricingZones(coverMonthlyPriceRepository, coverPricingZones, partnerCode, roomCount)
        const quote: Quote = Quote.create(createQuoteCommand, partner, defaultCapAdvice, coverMonthlyPrices)
        await quoteRepository.save(quote)
        return quote
      }
    }
}
