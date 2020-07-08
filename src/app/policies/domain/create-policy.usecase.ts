import { CreatePolicyCommand } from './create-policy-command'
import { QuoteRepository } from '../../quotes/domain/quote.repository'
import { Quote } from '../../quotes/domain/quote'
import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { SendValidationLinkToEmailAddress } from '../../email-validations/domain/send-validation-link-to-email-address.usecase'
import { PartnerRepository } from '../../partners/domain/partner.repository'

export interface CreatePolicy {
    (createPolicyCommand: CreatePolicyCommand): Promise<Policy>
}

export namespace CreatePolicy {

    export function factory (policyRepository: PolicyRepository, quoteRepository: QuoteRepository,
      partnerRepository: PartnerRepository, sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress): CreatePolicy {
      return async (createPolicyCommand: CreatePolicyCommand): Promise<Policy> => {
        const quote: Quote = await quoteRepository.get(createPolicyCommand.quoteId)
        const newPolicy: Policy = await Policy.create(createPolicyCommand, quote, policyRepository)
        await sendValidationEmail(partnerRepository, newPolicy, sendValidationLinkToEmailAddress)
        return await policyRepository.save(newPolicy)
      }
    }

    async function sendValidationEmail (partnerRepository, newPolicy, sendValidationLinkToEmailAddress) {
      const partnerCallbackUrl: string = await partnerRepository.getCallbackUrl(newPolicy.partnerCode)
      await sendValidationLinkToEmailAddress({ email: newPolicy.contact.email, callbackUrl: partnerCallbackUrl })
    }
}
