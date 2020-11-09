import { Quote } from '../../domain/quote'

export function quoteToResource (quote: Quote) {
  return {
    id: quote.id,
    code: quote.partnerCode,
    special_operations_code: quote.specialOperationsCode,
    special_operations_code_applied_at: quote.specialOperationsCodeAppliedAt ? new Date(quote.specialOperationsCodeAppliedAt) : undefined,
    risk: _toRisk(quote.risk),
    insurance: _toInsurance(quote.insurance)
  }
}

function _toRisk (risk: Quote.Risk) {
  return {
    property: {
      room_count: risk.property.roomCount,
      address: risk.property.address,
      postal_code: risk.property.postalCode ? parseInt(risk.property.postalCode) : undefined,
      city: risk.property.city
    }
  }
}

function _toInsurance (insurance: Quote.Insurance) {
  return {
    monthly_price: insurance.estimate.monthlyPrice,
    default_deductible: insurance.estimate.defaultDeductible,
    default_ceiling: insurance.estimate.defaultCeiling,
    currency: insurance.currency,
    simplified_covers: insurance.simplifiedCovers,
    product_code: insurance.productCode,
    product_version: insurance.productVersion,
    contractual_terms: insurance.contractualTerms,
    ipid: insurance.ipid
  }
}
