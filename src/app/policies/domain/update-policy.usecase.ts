import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { ComputePriceWithOperationCode } from '../../pricing/domain/compute-price-with-operation-code.usecase'
import { PolicyNotUpdatable } from './policies.errors'
import { Price } from '../../pricing/domain/price'

export interface UpdatePolicy {
    (updatePolicyCommand: UpdatePolicyCommand): Promise<Policy>
}

export interface UpdatePolicyCommand {
    policyId: string,
    operationCode?: string,
    startDate: Date
}

export namespace UpdatePolicy {

    export function factory (policyRepository: PolicyRepository, computePriceWithOperationalCode: ComputePriceWithOperationCode): UpdatePolicy {
      return async (updatePolicyCommand: UpdatePolicyCommand): Promise<Policy> => {
        const policyId = updatePolicyCommand.policyId
        const operationCode = updatePolicyCommand.operationCode
        const policy = await policyRepository.get(policyId)
        let price: Price

        if (Policy.isSigned(policy)) {
          throw new PolicyNotUpdatable(policy.id, policy.status)
        }

        if (operationCode) {
          price = await computePriceWithOperationalCode({ policyId, operationCode })
          Policy.updatePolicyPrice(policy, price)
          Policy.updatePolicyStartDate(policy, updatePolicyCommand.startDate, price.nbMonthsDue)
        } else {
          Policy.updatePolicyStartDate(policy, updatePolicyCommand.startDate)
        }

        await policyRepository.update(policy)
        return policy
      }
    }
}
