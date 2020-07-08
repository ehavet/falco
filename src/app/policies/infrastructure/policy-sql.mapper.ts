import { Policy } from '../domain/policy'
import { PolicySqlModel } from './policy-sql.model'
import { RiskSqlModel } from '../../quotes/infrastructure/risk-sql.model'
import { InsuranceSqlModel } from '../../quotes/infrastructure/insurance-sql.model'

export function sqlToPolicyMapper (policySql: PolicySqlModel): Policy {
  return {
    id: policySql.id,
    partnerCode: policySql.partnerCode,
    insurance: _sqlToInsuranceMapper(policySql.insurance),
    risk: _sqlToRiskMapper(policySql.risk),
    contact: policySql.contact,
    premium: policySql.premium,
    nbMonthsDue: policySql.nbMonthsDue,
    startDate: new Date(policySql.startDate),
    termStartDate: new Date(policySql.termStartDate),
    termEndDate: new Date(policySql.termEndDate),
    signatureDate: policySql.signatureDate,
    paymentDate: policySql.paymentDate,
    subscriptionDate: policySql.subscriptionDate,
    status: policySql.status
  }
}

function _sqlToRiskMapper (riskSql: RiskSqlModel) {
  return {
    property: riskSql.property,
    people: {
      policyHolder: riskSql.policyHolder,
      otherInsured: riskSql.otherInsured
    }
  }
}

function _sqlToInsuranceMapper (insuranceSql: InsuranceSqlModel) {
  return {
    estimate: {
      monthlyPrice: insuranceSql.monthlyPrice,
      defaultDeductible: insuranceSql.defaultDeductible,
      defaultCeiling: insuranceSql.defaultCeiling
    },
    currency: insuranceSql.currency,
    simplifiedCovers: insuranceSql.simplifiedCovers,
    productCode: insuranceSql.productCode,
    productVersion: insuranceSql.productVersion
  }
}
