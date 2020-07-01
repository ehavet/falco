import { Quote } from './quote'
import { GetQuoteQuery } from './get-quote-query'
import { QuoteRepository } from './quote.repository'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'

export interface GetQuote {
    (getQuoteQuery: GetQuoteQuery): Promise<Quote>
}

export namespace GetQuote {

    export function factory (quoteRepository: QuoteRepository, partnerRepository: PartnerRepository): GetQuote {
      return async (getQuote: GetQuoteQuery): Promise<Quote> => {
        const partnerCode = getQuote.partnerCode
        const risk = getQuote.risk

        const partnerOffer: Partner.Offer = await partnerRepository.getOffer(partnerCode)
        const insurance: Quote.Insurance = Quote.getInsurance(risk, partnerOffer, partnerCode)
        const quoteId: string = Quote.nextId()

        const quote: Quote = {
          id: quoteId,
          partnerCode: partnerCode,
          risk: risk,
          insurance: insurance
        }
        await quoteRepository.save(quote)

        return quote
      }
    }
}
