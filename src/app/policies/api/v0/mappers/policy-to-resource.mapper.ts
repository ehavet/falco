import { Policy } from '../../../domain/policy'
import dayjs from 'dayjs'
import { Quote } from '../../../../quotes/domain/quote'

export function policyToResource (policy: Policy) {
  return {
    id: policy.id,
    code: policy.partnerCode,
    insurance: _toInsurance(policy.insurance),
    risk: _toRisk(policy.risk),
    contact: _toContact(policy.contact),
    nb_months_due: policy.nbMonthsDue,
    premium: policy.premium,
    start_date: dayjs(policy.startDate).format('YYYY-MM-DD'),
    term_start_date: dayjs(policy.termStartDate).format('YYYY-MM-DD'),
    term_end_date: dayjs(policy.termEndDate).format('YYYY-MM-DD'),
    subscription_date: policy.subscriptionDate ? policy.subscriptionDate : null,
    signature_date: policy.signatureDate ? policy.signatureDate : null,
    payment_date: policy.paymentDate ? policy.paymentDate : null,
    status: policy.status
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

function _toContact (contact: Policy.Contact) {
  return {
    lastname: contact.lastname,
    firstname: contact.firstname,
    address: contact.address,
    postal_code: contact.postalCode,
    city: contact.city,
    email: contact.email,
    phone_number: contact.phoneNumber
  }
}

function _toRisk (risk: Policy.Risk) {
  return {
    property: {
      room_count: risk.property.roomCount,
      address: risk.property.address,
      postal_code: risk.property.postalCode,
      city: risk.property.city
    },
    people: {
      policy_holder: {
        firstname: risk.people.policyHolder.firstname,
        lastname: risk.people.policyHolder.lastname
      },
      other_insured: _toOtherInsured(risk.people.otherInsured)
    }
  }
}

function _toOtherInsured (otherInsured: Policy.Risk.People.OtherInsured[]) {
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
