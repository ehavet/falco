import { Policy } from '../../../domain/policy'
import dayjs from '../../../../../libs/dayjs'
import { Quote } from '../../../../quotes/domain/quote'

export function policyToResource (policy: Policy) {
  return {
    id: policy.id,
    code: policy.partnerCode,
    insurance: _toInsurance(policy.insurance),
    risk: _toRisk(policy.risk),
    policy_holder: _toPolicyHolder(policy.contact, policy),
    nb_months_due: policy.nbMonthsDue,
    premium: policy.premium,
    start_date: dayjs(policy.startDate).format('YYYY-MM-DD'),
    term_start_date: dayjs(policy.termStartDate).format('YYYY-MM-DD'),
    term_end_date: dayjs(policy.termEndDate).format('YYYY-MM-DD'),
    subscribed_at: policy.subscriptionDate ? policy.subscriptionDate : null,
    signed_at: policy.signatureDate ? policy.signatureDate : null,
    paid_at: policy.paymentDate ? policy.paymentDate : null,
    special_operations_code: policy.specialOperationsCode ?? null,
    special_operations_code_applied_at: policy.specialOperationsCodeAppliedAt ?? null,
    status: policy.status
  }
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

function _toPolicyHolder (contact: Policy.Holder, policy: Policy) {
  return {
    lastname: contact.lastname,
    firstname: contact.firstname,
    address: contact.address,
    postal_code: contact.postalCode,
    city: contact.city,
    email: contact.email,
    phone_number: contact.phoneNumber,
    email_validated_at: policy.emailValidationDate
  }
}

function _toRisk (risk: Policy.Risk) {
  return {
    property: {
      room_count: risk.property.roomCount,
      address: risk.property.address,
      postal_code: risk.property.postalCode,
      city: risk.property.city,
      type: risk.property.type,
      occupancy: risk.property.occupancy
    },
    person: {
      firstname: risk.people.person.firstname,
      lastname: risk.people.person.lastname
    },
    other_people: _toOtherInsured(risk.people.otherPeople)
  }
}

function _toOtherInsured (otherInsured: Policy.Risk.People.OtherPeople[]) {
  if (otherInsured) {
    return otherInsured.map(oiDomain => {
      return {
        firstname: oiDomain.firstname,
        lastname: oiDomain.lastname
      }
    })
  }
  return []
}
