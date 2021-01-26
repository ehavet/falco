import { UpdateQuoteCommand } from './update-quote-command'
import { Quote } from './quote'
import { QuoteRepository } from './quote.repository'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'
import { OperationCode } from '../../common-api/domain/operation-code'
import { DefaultCapAdviceRepository } from './default-cap-advice/default-cap-advice.repository'
import { CoverMonthlyPriceRepository } from './cover-monthly-price/cover-monthly-price.repository'
import { CoverPricingZoneRepository } from './cover-pricing-zone/cover-pricing-zone.repository'
import { CoverMonthlyPrice } from './cover-monthly-price/cover-monthly-price'
import { getCoverMonthlyPrices } from './quote.func'

export interface UpdateQuote {
    (updateQuoteCommand: UpdateQuoteCommand): Promise<Quote>
}

export namespace UpdateQuote {

  export function factory (
    quoteRepository: QuoteRepository,
    partnerRepository: PartnerRepository,
    defaultCapAdviceRepository: DefaultCapAdviceRepository,
    coverMonthlyPriceRepository: CoverMonthlyPriceRepository,
    pricingZoneRepository: CoverPricingZoneRepository
  ): UpdateQuote {
    return async (updateQuoteCommand: UpdateQuoteCommand): Promise<Quote> => {
      const quote: Quote = await quoteRepository.get(updateQuoteCommand.id)
      const partnerCode = quote.partnerCode
      const { city, postalCode, roomCount } = updateQuoteCommand.risk.property
      const partner: Partner = await partnerRepository.getByCode(partnerCode)
      const { productCode } = partner.offer
      const partnerOperationCodes: Array<OperationCode> = await partnerRepository.getOperationCodes(partnerCode)
      const defaultCapAdvice = await defaultCapAdviceRepository.get(partnerCode, updateQuoteCommand.risk.property.roomCount)
      const coverMonthlyPrices: Array<CoverMonthlyPrice> = await getCoverMonthlyPrices(coverMonthlyPriceRepository, pricingZoneRepository, productCode, partnerCode, roomCount, city, postalCode)
      const updatedQuote: Quote = Quote.update(quote, partner, updateQuoteCommand, partnerOperationCodes, defaultCapAdvice, coverMonthlyPrices)

      return await quoteRepository.update(updatedQuote)
    }
  }
}
