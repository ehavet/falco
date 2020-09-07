import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { ApplySpecialOperationCodeOnPolicy } from './apply-special-operation-code-on-policy.usecase'
import { PolicyCanceledError, PolicyNotUpdatableError } from './policies.errors'

export interface UpdatePolicy {
    (updatePolicyCommand: UpdatePolicyCommand): Promise<Policy>
}

export interface UpdatePolicyCommand {
    policyId: string,
    operationCode?: string,
    startDate: Date
}

export namespace UpdatePolicy {

    export function factory (policyRepository: PolicyRepository, applySpecialOperationCodeOnPolicy: ApplySpecialOperationCodeOnPolicy): UpdatePolicy {
      return async (updatePolicyCommand: UpdatePolicyCommand): Promise<Policy> => {
        const policyId = updatePolicyCommand.policyId
        const operationCode = updatePolicyCommand.operationCode
        let policy = await policyRepository.get(policyId)

        if (Policy.isCancelled(policy)) { throw new PolicyCanceledError(policy.id) }
        if (Policy.isSigned(policy)) { throw new PolicyNotUpdatableError(policy.id, policy.status) }

        if (operationCode) {
          policy = await applySpecialOperationCodeOnPolicy({ policyId, operationCode })
        }

        Policy.applyStartDate(policy, updatePolicyCommand.startDate)
        await policyRepository.update(policy)
        return policy
      }
    }
}
