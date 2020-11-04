import { QuoteRepository } from './quote.repository'
import { Quote } from './quote'
import { SendValidationLinkToEmailAddress } from '../../email-validations/domain/send-validation-link-to-email-address.usecase'
import { QuotePolicyHolderEmailNotFoundError } from './quote.errors'
import { PartnerRepository } from '../../partners/domain/partner.repository'

export interface SendValidationLinkEmailToQuotePolicyHolder {
    (quoteId: string): Promise<void>
}

export namespace SendValidationLinkEmailToQuotePolicyHolder {

    export function factory (quoteRepository: QuoteRepository, partnerRepository: PartnerRepository, sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress) {
      return async (quoteId: string): Promise<void> => {
        const quote: Quote = await quoteRepository.get(quoteId)
        await sendValidationEmail(partnerRepository, quote, sendValidationLinkToEmailAddress)
      }
    }

    async function sendValidationEmail (
      partnerRepository: PartnerRepository,
      quote: Quote,
      sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress
    ) {
      const quoteId = quote.id
      if (Quote.isPolicyHolderEmailUndefined(quote)) { throw new QuotePolicyHolderEmailNotFoundError(quoteId) }

      const partnerCallbackUrl: string = await partnerRepository.getCallbackUrl(quote.partnerCode)

      await sendValidationLinkToEmailAddress({
        email: quote.policyHolder!.email!,
        callbackUrl: partnerCallbackUrl,
        partnerCode: quote.partnerCode,
        quoteId
      })
    }
}
