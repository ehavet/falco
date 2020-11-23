import { CreatePolicyForQuoteCommand } from './create-policy-for-quote-command'
import { QuoteRepository } from '../../quotes/domain/quote.repository'
import { Quote } from '../../quotes/domain/quote'
import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { CreatePolicyQuotePartnerOwnershipError } from './policies.errors'
export interface CreatePolicyForQuote {
    (createPolicyForQuoteCommand: CreatePolicyForQuoteCommand): Promise<Policy>
}

export namespace CreatePolicyForQuote {

    export function factory (
      policyRepository: PolicyRepository,
      quoteRepository: QuoteRepository
    ): CreatePolicyForQuote {
      return async (command: CreatePolicyForQuoteCommand): Promise<Policy> => {
        const quote: Quote = await quoteRepository.get(command.quoteId)

        if (Quote.isNotIssuedForPartner(quote, command.partnerCode)) throw new CreatePolicyQuotePartnerOwnershipError(quote.id, command.partnerCode)
        const availablePolicyId: string = _generateAvailablePolicyId(quote, policyRepository)
        const policy: Policy = await Policy.createFromQuote(availablePolicyId, quote)
        return await policyRepository.save(policy)
      }
    }

    function _generateAvailablePolicyId (quote: Quote, policyRepository: PolicyRepository): string {
      const productCode = Quote.getProductCode(quote)
      const generatedPolicyId: string = Policy.generateId(quote.partnerCode, productCode)
      return policyRepository.isIdAvailable(generatedPolicyId) ? generatedPolicyId : _generateAvailablePolicyId(quote, policyRepository)
    }
}
