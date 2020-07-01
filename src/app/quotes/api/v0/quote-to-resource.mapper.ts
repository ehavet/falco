import { Quote } from '../../domain/quote'

export function quoteToResource (quote: Quote) {
  return {
    id: quote.id,
    code: quote.partnerCode,
    risk: _toRisk(quote.risk),
    insurance: _toInsurance(quote.insurance)
  }
}

function _toRisk (risk: Quote.Risk) {
  return {
    property: {
      room_count: risk.property.roomCount
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
    product_version: insurance.productVersion
  }
}
