import { Quote } from '../../../domain/quote'
import dayjs from '../../../../../libs/dayjs'

export function quoteToResource (quote: Quote) {
  return {
    id: quote.id,
    code: quote.partnerCode,
    risk: _toRisk(quote.risk),
    insurance: _toInsurance(quote.insurance),
    policy_holder: quote.policyHolder ? _toPolicyHolder(quote.policyHolder) : null,
    start_date: quote.startDate ? dayjs(quote.startDate).format('YYYY-MM-DD') : null,
    term_start_date: quote.termStartDate ? dayjs(quote.termStartDate).format('YYYY-MM-DD') : null,
    term_end_date: quote.termEndDate ? dayjs(quote.termEndDate).format('YYYY-MM-DD') : null,
    premium: quote.premium,
    nb_months_due: quote.nbMonthsDue,
    special_operations_code: quote.specialOperationsCode ?? null,
    special_operations_code_applied_at: quote.specialOperationsCodeAppliedAt ?? null
  }
}

function _toRisk (risk: Quote.Risk) {
  return {
    property: {
      room_count: risk.property.roomCount,
      address: risk.property.address ?? null,
      postal_code: risk.property.postalCode ?? null,
      city: risk.property.city ?? null,
      type: risk.property.type ?? null,
      occupancy: risk.property.occupancy ?? null
    },
    person: risk.person ? _toPerson(risk.person) : null,
    other_people: risk.otherPeople ? _toOtherPeople(risk.otherPeople) : []
  }
}

function _toOtherPeople (otherInsured: Quote.Risk.Person[]) {
  return otherInsured.map(insured => {
    return _toPerson(insured)
  }).filter(insured => insured != null)
}

function _toPerson (person) {
  // Because right now we save empty persons/otherPeople in database, we have to do this check here so that they are not returned within the payload
  // The quoteRepository should be fixed in a near future and then this condition removed
  if (person.firstname || person.lastname) {
    return {
      firstname: person.firstname,
      lastname: person.lastname
    }
  }

  return null
}

function _toInsurance (insurance: Quote.Insurance) {
  return {
    monthly_price: insurance.estimate.monthlyPrice,
    default_deductible: insurance.estimate.defaultDeductible,
    default_cap: insurance.estimate.defaultCeiling,
    currency: insurance.currency,
    simplified_covers: insurance.simplifiedCovers,
    product_code: insurance.productCode,
    product_version: insurance.productVersion,
    contractual_terms: insurance.contractualTerms,
    ipid: insurance.ipid
  }
}

function _toPolicyHolder (policyHolder: Quote.PolicyHolder) {
  return {
    firstname: policyHolder.firstname ?? null,
    lastname: policyHolder.lastname ?? null,
    address: policyHolder.address ?? null,
    postal_code: policyHolder.postalCode ?? null,
    city: policyHolder.city ?? null,
    email: policyHolder.email ?? null,
    phone_number: policyHolder.phoneNumber ?? null,
    email_validated_at: policyHolder.emailValidatedAt ?? null
  }
}
