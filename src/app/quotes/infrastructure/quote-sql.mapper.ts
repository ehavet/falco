import { Quote } from '../domain/quote'
import { QuoteSqlModel } from './sql-models/quote-sql-model'

export function sqlToQuoteMapper (quoteSql: QuoteSqlModel): Quote {
  return {
    id: quoteSql.id,
    partnerCode: quoteSql.partnerCode,
    risk: _sqlToRiskMapper(quoteSql),
    insurance: _sqlToInsuranceMapper(quoteSql)
  }
}

function _sqlToRiskMapper (quoteSql: QuoteSqlModel) {
  return {
    property: {
      roomCount: quoteSql.risk.property.roomCount
    }
  }
}

function _sqlToInsuranceMapper (quoteSql: QuoteSqlModel) {
  return {
    estimate: {
      monthlyPrice: quoteSql.insurance.monthlyPrice,
      defaultDeductible: quoteSql.insurance.defaultDeductible,
      defaultCeiling: quoteSql.insurance.defaultCeiling
    },
    currency: quoteSql.insurance.currency,
    simplifiedCovers: quoteSql.insurance.simplifiedCovers,
    productCode: quoteSql.insurance.productCode,
    productVersion: quoteSql.insurance.productVersion,
    contractualTerms: quoteSql.insurance.contractualTerms,
    ipid: quoteSql.insurance.ipid
  }
}
