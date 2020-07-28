import { Price } from './price'
import { ComputePriceWithOperationalCodeCommand } from './compute-price-with-operational-code-command'
import { PolicyRepository } from '../../policies/domain/policy.repository'

export interface ComputePriceWithOperationalCode {
    (computePriceWithOperationalCodeCommand: ComputePriceWithOperationalCodeCommand): Promise<Price>
}

export namespace ComputePriceWithOperationalCode {

    export function factory (policyRepository: PolicyRepository): ComputePriceWithOperationalCode {
      return async (computePriceWithOperationalCodeCommand: ComputePriceWithOperationalCodeCommand): Promise<Price> => {
        const policy = await policyRepository.get(computePriceWithOperationalCodeCommand.policyId)
        throw new Error(policy.toString())
      }
    }
}
