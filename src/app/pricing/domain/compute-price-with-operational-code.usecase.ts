import { Price } from './price'
import { ComputePriceWithOperationalCodeCommand } from './compute-price-with-operational-code-command'
import { PolicyRepository } from '../../policies/domain/policy.repository'
import { OperationalCode } from './operational-code'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { OperationalCodeNotApplicableError } from './operational-code.errors'

export interface ComputePriceWithOperationalCode {
    (computePriceWithOperationalCodeCommand: ComputePriceWithOperationalCodeCommand): Promise<Price>
}

export namespace ComputePriceWithOperationalCode {

    export function factory (policyRepository: PolicyRepository, partnerRepository: PartnerRepository): ComputePriceWithOperationalCode {
      return async (computePriceWithOperationalCodeCommand: ComputePriceWithOperationalCodeCommand): Promise<Price> => {
        const operationalCode: OperationalCode = OperationalCode[computePriceWithOperationalCodeCommand.operationalCode]

        const policy = await policyRepository.get(computePriceWithOperationalCodeCommand.policyId)
        const partnerOperationCodes: Array<OperationalCode> = await partnerRepository.getOperationalCodes(policy.partnerCode)
        if (partnerOperationCodes.includes(operationalCode)) {
          switch (operationalCode) {
            case OperationalCode.SEMESTER1:
            case OperationalCode.SEMESTER2:
              return _getPriceForMonthsDue(5, policy.insurance.estimate.monthlyPrice)
            case OperationalCode.FULLYEAR:
              return _getPriceForMonthsDue(10, policy.insurance.estimate.monthlyPrice)
          }
        }
        throw new OperationalCodeNotApplicableError(computePriceWithOperationalCodeCommand.operationalCode, policy.partnerCode)
      }
    }
}

function _getPriceForMonthsDue (nbMonthsDue: number, monthlyPrice: number) {
  return { premium: nbMonthsDue * monthlyPrice, nbMonthsDue, monthlyPrice }
}
