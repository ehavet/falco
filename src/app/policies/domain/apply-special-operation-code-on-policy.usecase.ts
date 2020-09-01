import { ApplySpecialOperationCodeCommand } from './apply-special-operation-code-command'
import { PolicyRepository } from './policy.repository'
import { OperationCode } from './operation-code'
import { PartnerRepository } from '../../partners/domain/partner.repository'
import { OperationCodeNotApplicableError } from './operation-code.errors'
import { Policy } from './policy'
import { PolicyCanceledError, PolicyNotUpdatableError } from './policies.errors'

export interface ApplySpecialOperationCodeOnPolicy {
    (computePriceWithOperationCodeCommand: ApplySpecialOperationCodeCommand): Promise<Policy>
}

export namespace ApplySpecialOperationCodeOnPolicy {

    export function factory (policyRepository: PolicyRepository, partnerRepository: PartnerRepository): ApplySpecialOperationCodeOnPolicy {
      return async (applySpecialOperationCodeCommand: ApplySpecialOperationCodeCommand): Promise<Policy> => {
        const operationCode: OperationCode = _getOperationCode(applySpecialOperationCodeCommand.operationCode)
        const policy = await policyRepository.get(applySpecialOperationCodeCommand.policyId)

        if (Policy.isCanceled(policy)) { throw new PolicyCanceledError(policy.id) }
        if (Policy.isSigned(policy)) { throw new PolicyNotUpdatableError(policy.id, policy.status) }

        const partnerOperationCodes: Array<OperationCode> = await partnerRepository.getOperationCodes(policy.partnerCode)

        if (partnerOperationCodes.concat(OperationCode.BLANK).includes(operationCode)) {
          switch (operationCode) {
            case OperationCode.SEMESTER1:
            case OperationCode.SEMESTER2:
              Policy.applyNbMonthsDue(policy, 5)
              break
            case OperationCode.FULLYEAR:
              Policy.applyNbMonthsDue(policy, 10)
              break
            case OperationCode.BLANK:
              Policy.applyNbMonthsDue(policy, 12)
          }
          policyRepository.update(policy)
          return policy
        }
        throw new OperationCodeNotApplicableError(applySpecialOperationCodeCommand.operationCode, policy.partnerCode)
      }
    }
}

function _getOperationCode (operationCode: string): OperationCode {
  const parsedCode: string = operationCode.replace(/[\W_]+/g, '').toUpperCase()
  return OperationCode[parsedCode]
}
