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
    contact: {
      firstname: policySql.contact.firstname,
      lastname: policySql.contact.lastname,
      address: policySql.contact.address,
      postalCode: policySql.contact.postalCode,
      city: policySql.contact.city,
      email: policySql.contact.email,
      phoneNumber: policySql.contact.phoneNumber
    },
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
    property: {
      roomCount: riskSql.property.roomCount,
      address: riskSql.property.address,
      postalCode: riskSql.property.postalCode,
      city: riskSql.property.city
    },
    people: {
      policyHolder: {
        firstname: riskSql.policyHolder.firstname,
        lastname: riskSql.policyHolder.lastname
      },
      otherInsured: riskSql.otherInsured.map((insured) => {
        return { firstname: insured.firstname, lastname: insured.lastname }
      })
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
