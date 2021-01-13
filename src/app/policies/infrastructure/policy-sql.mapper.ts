import { Policy } from '../domain/policy'
import { PolicySqlModel } from './policy-sql.model'
import { PolicyInsuranceSqlModel } from '../../quotes/infrastructure/policy-insurance-sql.model'
import { PolicyRiskSqlModel } from '../../quotes/infrastructure/policy-risk-sql.model'
import { Amount } from '../../common-api/domain/amount/amount'

export function sqlToDomain (policySql: PolicySqlModel): Policy {
  return {
    id: policySql.id,
    partnerCode: policySql.partnerCode,
    insurance: _sqlToInsuranceMapper(policySql.insurance),
    risk: _sqlToRiskMapper(policySql.risk),
    contact: {
      firstname: policySql.policyHolder.firstname,
      lastname: policySql.policyHolder.lastname,
      address: policySql.policyHolder.address,
      postalCode: policySql.policyHolder.postalCode,
      city: policySql.policyHolder.city,
      email: policySql.policyHolder.email,
      phoneNumber: policySql.policyHolder.phoneNumber
    },
    premium: Amount.toAmount(policySql.premium),
    nbMonthsDue: policySql.nbMonthsDue,
    startDate: new Date(policySql.startDate),
    termStartDate: new Date(policySql.termStartDate),
    termEndDate: new Date(policySql.termEndDate),
    signatureDate: policySql.signatureDate,
    paymentDate: policySql.paymentDate,
    subscriptionDate: policySql.subscriptionDate,
    emailValidationDate: policySql.emailValidationDate,
    status: policySql.status,
    specialOperationsCode: policySql.specialOperationsCode ?? null,
    specialOperationsCodeAppliedAt: policySql.specialOperationsCodeAppliedAt ?? null
  }
}

function _sqlToRiskMapper (riskSql: PolicyRiskSqlModel) {
  return {
    property: {
      roomCount: riskSql.property.roomCount,
      address: riskSql.property.address,
      postalCode: riskSql.property.postalCode,
      city: riskSql.property.city,
      type: riskSql.property.type
    },
    people: {
      person: {
        firstname: riskSql.person.firstname,
        lastname: riskSql.person.lastname
      },
      otherPeople: riskSql.otherPeople!.map((insured) => {
        return { firstname: insured.firstname, lastname: insured.lastname }
      })
    }
  }
}

function _sqlToInsuranceMapper (insuranceSql: PolicyInsuranceSqlModel) {
  return {
    estimate: {
      monthlyPrice: Amount.toAmount(insuranceSql.monthlyPrice),
      defaultDeductible: Amount.toAmount(insuranceSql.defaultDeductible),
      defaultCeiling: Amount.toAmount(insuranceSql.defaultCeiling)
    },
    currency: insuranceSql.currency,
    simplifiedCovers: insuranceSql.simplifiedCovers,
    productCode: insuranceSql.productCode,
    productVersion: insuranceSql.productVersion,
    contractualTerms: insuranceSql.contractualTerms,
    ipid: insuranceSql.ipid
  }
}
