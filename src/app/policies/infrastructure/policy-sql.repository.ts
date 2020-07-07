import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { Policy } from '../domain/policy'
import { PolicySqlModel } from './policy-sql.model'
import { RiskSqlModel } from '../../quotes/infrastructure/risk-sql.model'

export class PolicySqlRepository implements PolicyRepository {
  save (policy: Policy): Promise<Policy> {
    const policySql = PolicySqlModel.build({
      id: policy.id,
      partnerCode: policy.partnerCode,
      premium: policy.premium,
      nbMonthsDue: policy.nbMonthsDue,
      startDate: policy.startDate,
      termStartDate: policy.termStartDate,
      termEndDate: policy.termEndDate,
      signatureDate: policy.signatureDate,
      paymentDate: policy.paymentDate,
      subscriptionDate: policy.subscriptionDate,
      risk: {
        property: policy.risk.property,
        policyHolder: policy.risk.people.policyHolder,
        otherInsured: policy.risk.people.otherInsured
      },
      insurance: {
        monthlyPrice: policy.insurance.estimate.monthlyPrice,
        currency: policy.insurance.currency,
        defaultDeductible: policy.insurance.estimate.defaultDeductible,
        defaultCeiling: policy.insurance.estimate.defaultCeiling,
        simplifiedCovers: policy.insurance.simplifiedCovers,
        productCode: policy.insurance.productCode,
        productVersion: policy.insurance.productVersion
      },
      contact: policy.contact
    }, {
      include: [{ all: true }, { model: RiskSqlModel, include: [{ all: true }] }]
    })

    return policySql.save()
  }

  isIdAvailable (policyId: string): Promise<boolean> {
    return Promise.reject(new Error(`Not implemented yet ${policyId}`))
  }
}
