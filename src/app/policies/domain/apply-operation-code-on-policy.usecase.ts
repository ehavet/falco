import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'

export interface ApplyOperationCodeOnPolicy {
    (applyOperationCodeOnPolicyCommand: ApplyOperationCodeOnPolicyCommand): Promise<Policy>
}

export interface ApplyOperationCodeOnPolicyCommand {
    policyId: string,
    operationCode: string
}

export namespace ApplyOperationCodeOnPolicy {

    export function factory (policyRepository: PolicyRepository): ApplyOperationCodeOnPolicy {
      return async (applyOperationCodeOnPolicyCommand: ApplyOperationCodeOnPolicyCommand): Promise<Policy> => {
        const policyId = applyOperationCodeOnPolicyCommand.policyId
        const policy = await policyRepository.get(policyId)
        return policy
      }
    }
}
