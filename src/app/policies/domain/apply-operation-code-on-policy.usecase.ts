import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { ComputePriceWithOperationCode } from '../../pricing/domain/compute-price-with-operation-code.usecase'
import dayjs from 'dayjs'
import { PolicyNotUpdatable } from './policies.errors'

export interface ApplyOperationCodeOnPolicy {
    (applyOperationCodeOnPolicyCommand: ApplyOperationCodeOnPolicyCommand): Promise<Policy>
}

export interface ApplyOperationCodeOnPolicyCommand {
    policyId: string,
    operationCode: string,
    termStartDate: Date
}

export namespace ApplyOperationCodeOnPolicy {

    export function factory (policyRepository: PolicyRepository, computePriceWithOperationalCode: ComputePriceWithOperationCode): ApplyOperationCodeOnPolicy {
      return async (applyOperationCodeOnPolicyCommand: ApplyOperationCodeOnPolicyCommand): Promise<Policy> => {
        const policyId = applyOperationCodeOnPolicyCommand.policyId
        const operationCode = applyOperationCodeOnPolicyCommand.operationCode

        const policy = await policyRepository.get(policyId)

        if (Policy.isSigned(policy)) {
          throw new PolicyNotUpdatable(policy.id, policy.status)
        }

        const price = await computePriceWithOperationalCode({ policyId, operationCode })

        policy.premium = price.premium
        policy.nbMonthsDue = price.nbMonthsDue
        policy.startDate = applyOperationCodeOnPolicyCommand.termStartDate
        policy.termStartDate = applyOperationCodeOnPolicyCommand.termStartDate
        policy.termEndDate = dayjs(applyOperationCodeOnPolicyCommand.termStartDate).add(price.nbMonthsDue, 'month').toDate()

        await policyRepository.update(policy)
        return policy
      }
    }
}
