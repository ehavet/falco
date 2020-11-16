import { UpdateQuoteCommand } from './update-quote-command'
import { Quote } from './quote'
import { QuoteRepository } from './quote.repository'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'
import { OperationCode } from '../../common-api/domain/operation-code'

export interface UpdateQuote {
    (updateQuoteCommand: UpdateQuoteCommand): Promise<Quote>
}

export namespace UpdateQuote {

  export function factory (
    quoteRepository: QuoteRepository,
    partnerRepository: PartnerRepository
  ): UpdateQuote {
    return async (updateQuoteCommand: UpdateQuoteCommand): Promise<Quote> => {
      const quote: Quote = await quoteRepository.get(updateQuoteCommand.id)
      const partner: Partner = await partnerRepository.getByCode(quote.partnerCode)
      const partnerOperationCodes: Array<OperationCode> = await partnerRepository.getOperationCodes(quote.partnerCode)

      const updatedQuote: Quote = Quote.update(quote, partner, updateQuoteCommand, partnerOperationCodes)

      return await quoteRepository.update(updatedQuote)
    }
  }
}
