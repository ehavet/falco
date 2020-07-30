import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { ComputePriceWithOperationCode } from '../../pricing/domain/compute-price-with-operation-code.usecase'
import dayjs from 'dayjs'
import { PolicyNotUpdatable } from './policies.errors'

export interface UpdatePolicyStartDateAndDuration {
    (updatePolicyStartDateAndDurationCommand: UpdatePolicyStartDateAndDurationCommand): Promise<Policy>
}

export interface UpdatePolicyStartDateAndDurationCommand {
    policyId: string,
    operationCode: string,
    startDate: Date
}

export namespace UpdatePolicyStartDateAndDuration {

    export function factory (policyRepository: PolicyRepository, computePriceWithOperationalCode: ComputePriceWithOperationCode): UpdatePolicyStartDateAndDuration {
      return async (updatePolicyStartDateAndDurationCommand: UpdatePolicyStartDateAndDurationCommand): Promise<Policy> => {
        const policyId = updatePolicyStartDateAndDurationCommand.policyId
        const operationCode = updatePolicyStartDateAndDurationCommand.operationCode

        const policy = await policyRepository.get(policyId)

        if (Policy.isSigned(policy)) {
          throw new PolicyNotUpdatable(policy.id, policy.status)
        }

        const price = await computePriceWithOperationalCode({ policyId, operationCode })

        policy.premium = price.premium
        policy.nbMonthsDue = price.nbMonthsDue
        policy.startDate = updatePolicyStartDateAndDurationCommand.startDate
        policy.termStartDate = updatePolicyStartDateAndDurationCommand.startDate
        policy.termEndDate = dayjs(updatePolicyStartDateAndDurationCommand.startDate).add(price.nbMonthsDue, 'month').toDate()

        await policyRepository.update(policy)
        return policy
      }
    }
}
