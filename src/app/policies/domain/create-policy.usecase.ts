import { CreatePolicyCommand } from './create-policy-command'
import { QuoteRepository } from '../../quotes/domain/quote.repository'
import { Quote } from '../../quotes/domain/quote'
import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { SendValidationLinkToEmailAddress } from '../../email-validations/domain/send-validation-link-to-email-address.usecase'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'
import { DoesPartnerAllowRoommates } from '../../partners/domain/does-partner-allow-roommates.usecase'

export interface CreatePolicy {
    (createPolicyCommand: CreatePolicyCommand): Promise<Policy>
}

export namespace CreatePolicy {

    export function factory (policyRepository: PolicyRepository, quoteRepository: QuoteRepository,
      partnerRepository: PartnerRepository, sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress, doesPartnerAllowRoommates: DoesPartnerAllowRoommates): CreatePolicy {
      return async (createPolicyCommand: CreatePolicyCommand): Promise<Policy> => {
        const quote: Quote = await quoteRepository.get(createPolicyCommand.quoteId)
        const offer: Partner.Offer = await partnerRepository.getOffer(createPolicyCommand.partnerCode)
        const newPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository, offer.productCode, doesPartnerAllowRoommates)
        await sendValidationEmail(partnerRepository, newPolicy, sendValidationLinkToEmailAddress)
        return await policyRepository.save(newPolicy)
      }
    }

    async function sendValidationEmail (partnerRepository, newPolicy, sendValidationLinkToEmailAddress) {
      const partnerCallbackUrl: string = await partnerRepository.getCallbackUrl(newPolicy.partnerCode)
      await sendValidationLinkToEmailAddress({
        email: newPolicy.contact.email,
        callbackUrl: partnerCallbackUrl,
        partnerCode: newPolicy.partnerCode,
        policyId: newPolicy.id
      })
    }
}
