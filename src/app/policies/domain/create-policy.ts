import { Policy } from './policy'
import { CreatePolicyQuery } from './create-policy-query'
import { QuoteRepository } from '../../quotes/domain/quote.repository'
import { Quote } from '../../quotes/domain/quote'

export interface CreatePolicy {
    (createPolicyQuery: CreatePolicyQuery): Promise<Policy>
}

export namespace CreatePolicy {

    export function factory (quoteRepository: QuoteRepository): CreatePolicy {
      return async (createPolicyQuery: CreatePolicyQuery): Promise<Policy> => {
        const quote: Quote = await quoteRepository.get(createPolicyQuery.quoteId)
        return {
          insurance: quote.insurance
        }
      }
    }
}
