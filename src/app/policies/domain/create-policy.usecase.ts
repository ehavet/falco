import { CreatePolicyCommand } from './create-policy-command'
import { QuoteRepository } from '../../quotes/domain/quote.repository'
import { Quote } from '../../quotes/domain/quote'
import { Policy } from './policy'

export interface CreatePolicy {
    (createPolicyCommand: CreatePolicyCommand): Promise<Policy>
}

export namespace CreatePolicy {

    export function factory (quoteRepository: QuoteRepository): CreatePolicy {
      return async (createPolicyCommand: CreatePolicyCommand): Promise<Policy> => {
        const quote: Quote = await quoteRepository.get(createPolicyCommand.quoteId)
        return Policy.createPolicy(createPolicyCommand, quote)
      }
    }
}
