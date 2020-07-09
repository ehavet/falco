import { PolicyRepository } from '../domain/policy.repository'
import { Policy } from '../domain/policy'
import { PolicySqlModel } from './policy-sql.model'
import { RiskSqlModel } from '../../quotes/infrastructure/risk-sql.model'
import { sqlToPolicyMapper } from './policy-sql.mapper'
import { PolicyNotFoundError } from '../domain/policies.errors'

export class PolicySqlRepository implements PolicyRepository {
  async save (policy: Policy): Promise<Policy> {
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
      status: policy.status,
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

    const savedPolicy: PolicySqlModel = await policySql.save()
    return sqlToPolicyMapper(savedPolicy)
  }

  async get (policyId: string): Promise<Policy> {
    const policy: PolicySqlModel = await PolicySqlModel
      .findByPk(policyId, {
        rejectOnEmpty: false, include: [{ all: true }, { model: RiskSqlModel, include: [{ all: true }] }]
      })
    if (policy) {
      return sqlToPolicyMapper(policy)
    }
    throw new PolicyNotFoundError(policyId)
  }

  async isIdAvailable (policyId: string): Promise<boolean> {
    const foundPolicy: PolicySqlModel = await PolicySqlModel.findByPk(policyId, { rejectOnEmpty: false })
    if (foundPolicy) return false
    return true
  }
}
