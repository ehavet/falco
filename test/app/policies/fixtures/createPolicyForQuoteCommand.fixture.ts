import { CreatePolicyForQuoteCommand } from '../../../../src/app/policies/domain/create-policy-for-quote-command'

export function createCreatePolicyForQuoteCommand (attr: Partial<CreatePolicyForQuoteCommand> = {}): CreatePolicyForQuoteCommand {
  return {
    quoteId: '376DJ2',
    partnerCode: 'myPartner',
    ...attr
  }
}
