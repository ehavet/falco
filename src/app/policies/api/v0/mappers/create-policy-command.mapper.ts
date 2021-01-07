import { CreatePolicyCommand } from '../../../domain/create-policy-command'

export function requestToCreatePolicyCommand (payload): CreatePolicyCommand {
  return {
    partnerCode: payload.code,
    quoteId: payload.quote_id,
    risk: {
      property: {
        address: payload.risk.property?.address,
        // eslint-disable-next-line camelcase
        postalCode: payload.risk.property?.postal_code,
        city: payload.risk.property?.city,
        type: payload.risk.property?.type
      },
      people: {
        policyHolder: {
          firstname: payload.risk.people.policy_holder.firstname,
          lastname: payload.risk.people.policy_holder.lastname
        },
        otherInsured: _toOtherInsured(payload.risk.people.other_insured)
      }
    },
    contact: {
      email: payload.contact.email,
      phoneNumber: payload.contact.phone_number
    },
    startDate: payload.start_date ? new Date(payload.start_date) : null
  }
}

function _toOtherInsured (otherInsuredJson): CreatePolicyCommand.Risk.People.OtherInsured[] {
  if (otherInsuredJson) {
    return otherInsuredJson.map(oiJson => {
      return {
        firstname: oiJson.firstname,
        lastname: oiJson.lastname
      }
    })
  }
  return []
}
