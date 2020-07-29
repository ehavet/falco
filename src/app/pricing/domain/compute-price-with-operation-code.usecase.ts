import { Price } from './price'
import { ComputePriceWithOperationCodeCommand } from './compute-price-with-operation-code-command'
import { PolicyRepository } from '../../policies/domain/policy.repository'
import { OperationCode } from './operation-code'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { OperationCodeNotApplicableError } from './operation-code.errors'

export interface ComputePriceWithOperationCode {
    (computePriceWithOperationCodeCommand: ComputePriceWithOperationCodeCommand): Promise<Price>
}

export namespace ComputePriceWithOperationCode {

    export function factory (policyRepository: PolicyRepository, partnerRepository: PartnerRepository): ComputePriceWithOperationCode {
      return async (computePriceWithOperationCodeCommand: ComputePriceWithOperationCodeCommand): Promise<Price> => {
        const operationCode: OperationCode = OperationCode[computePriceWithOperationCodeCommand.operationCode]

        const policy = await policyRepository.get(computePriceWithOperationCodeCommand.policyId)
        const partnerOperationCodes: Array<OperationCode> = await partnerRepository.getOperationCodes(policy.partnerCode)
        if (partnerOperationCodes.includes(operationCode)) {
          switch (operationCode) {
            case OperationCode.SEMESTER1:
            case OperationCode.SEMESTER2:
              return _getPriceForMonthsDue(5, policy.insurance.estimate.monthlyPrice)
            case OperationCode.FULLYEAR:
              return _getPriceForMonthsDue(10, policy.insurance.estimate.monthlyPrice)
          }
        }
        throw new OperationCodeNotApplicableError(computePriceWithOperationCodeCommand.operationCode, policy.partnerCode)
      }
    }
}

function _getPriceForMonthsDue (nbMonthsDue: number, monthlyPrice: number) {
  return { premium: nbMonthsDue * monthlyPrice, nbMonthsDue, monthlyPrice }
}
