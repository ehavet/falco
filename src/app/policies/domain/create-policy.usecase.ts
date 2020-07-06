import { CreatePolicyCommand } from './create-policy-command'
import { QuoteRepository } from '../../quotes/domain/quote.repository'
import { Quote } from '../../quotes/domain/quote'
import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'

export interface CreatePolicy {
    (createPolicyCommand: CreatePolicyCommand): Promise<Policy>
}

export namespace CreatePolicy {

    export function factory (policyRepository: PolicyRepository, quoteRepository: QuoteRepository): CreatePolicy {
      return async (createPolicyCommand: CreatePolicyCommand): Promise<Policy> => {
        const quote: Quote = await quoteRepository.get(createPolicyCommand.quoteId)
        const newPolicy: Policy = await Policy.createPolicy(createPolicyCommand, quote, policyRepository)
        return await policyRepository.save(newPolicy)
      }
    }
}
