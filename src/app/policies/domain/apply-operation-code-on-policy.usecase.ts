import { Policy } from './policy'
import { PolicyRepository } from './policy.repository'
import { ComputePriceWithOperationCode } from '../../pricing/domain/compute-price-with-operation-code.usecase'

export interface ApplyOperationCodeOnPolicy {
    (applyOperationCodeOnPolicyCommand: ApplyOperationCodeOnPolicyCommand): Promise<Policy>
}

export interface ApplyOperationCodeOnPolicyCommand {
    policyId: string,
    operationCode: string
}

export namespace ApplyOperationCodeOnPolicy {

    export function factory (policyRepository: PolicyRepository, computePriceWithOperationalCode: ComputePriceWithOperationCode): ApplyOperationCodeOnPolicy {
      return async (applyOperationCodeOnPolicyCommand: ApplyOperationCodeOnPolicyCommand): Promise<Policy> => {
        const policyId = applyOperationCodeOnPolicyCommand.policyId
        const operationCode = applyOperationCodeOnPolicyCommand.operationCode

        const policy = await policyRepository.get(policyId)

        await computePriceWithOperationalCode({ policyId, operationCode })
        return policy
      }
    }
}
