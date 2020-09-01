import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { PolicyCanceledError, PolicyNotUpdatableError } from './policies.errors'

export interface ApplyStartDateOnPolicy {
    (command: ApplyStartDateOnPolicyCommand): Promise<Policy>
}

export interface ApplyStartDateOnPolicyCommand {
    policyId: string,
    startDate: Date
}

export namespace ApplyStartDateOnPolicy {
    export function factory (policyRepository: PolicyRepository) {
      return async (command: ApplyStartDateOnPolicyCommand) => {
        const policy: Policy = await policyRepository.get(command.policyId)

        if (Policy.isCanceled(policy)) { throw new PolicyCanceledError(policy.id) }
        if (Policy.isSigned(policy)) throw new PolicyNotUpdatableError(policy.id, policy.status)

        Policy.applyStartDate(policy, command.startDate)
        await policyRepository.update(policy)
        return policy
      }
    }
}
