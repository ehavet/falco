import { CreatePolicyForQuoteCommand } from './create-policy-for-quote-command'
import { QuoteRepository } from '../../quotes/domain/quote.repository'
import { Quote } from '../../quotes/domain/quote'
import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { CreatePolicyQuotePartnerOwnershipError } from './policies.errors'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { Partner } from '../../partners/domain/partner'
import * as PartnerFunc from '../../partners/domain/partner.func'
export interface CreatePolicyForQuote {
    (createPolicyForQuoteCommand: CreatePolicyForQuoteCommand): Promise<Policy>
}

export namespace CreatePolicyForQuote {

    export function factory (
      policyRepository: PolicyRepository,
      quoteRepository: QuoteRepository,
      partnerRepository: PartnerRepository
    ): CreatePolicyForQuote {
      return async (command: CreatePolicyForQuoteCommand): Promise<Policy> => {
        const quote: Quote = await quoteRepository.get(command.quoteId)

        if (Quote.isNotIssuedForPartner(quote, command.partnerCode)) throw new CreatePolicyQuotePartnerOwnershipError(quote.id, command.partnerCode)
        const partner: Partner = await partnerRepository.getByCode(quote.partnerCode)
        const partnerTrigram = PartnerFunc.getTrigram(partner)
        const productCode = Quote.getProductCode(quote)
        const availablePolicyId: string = _generateAvailablePolicyId(partnerTrigram, productCode, policyRepository)
        const policy: Policy = await Policy.createFromQuote(availablePolicyId, quote)
        return await policyRepository.save(policy)
      }
    }

    function _generateAvailablePolicyId (partnerTrigram, productCode, policyRepository: PolicyRepository): string {
      const generatedPolicyId: string = Policy.generateId(partnerTrigram, productCode)
      return policyRepository.isIdAvailable(generatedPolicyId) ? generatedPolicyId : _generateAvailablePolicyId(partnerTrigram, productCode, policyRepository)
    }
}
